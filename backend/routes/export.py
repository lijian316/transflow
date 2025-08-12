from flask import Blueprint, request, jsonify
import sqlite3
import json
from models.database import db_config, LANGUAGES, get_language_activation_status

export_bp = Blueprint('export', __name__)

@export_bp.route('/api/export/<language>', methods=['GET'])
def export_language_data(language):
    """导出指定语言的数据"""
    try:
        db_path = db_config.get_current_db()
        
        if language not in LANGUAGES:
            return jsonify({'success': False, 'error': '不支持的语言'}), 400
        
        # 检查语言是否激活
        if not get_language_activation_status(db_path, language):
            return jsonify({'success': False, 'error': f'语言 {language} 未激活'}), 400
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取所有翻译数据
        if language == 'english':
            cursor.execute('''
                SELECT e.id, e.english_text, e.translation_key, e.tag
                FROM english e
                ORDER BY e.id
            ''')
        else:
            cursor.execute(f'''
                SELECT e.id, e.english_text, e.translation_key, e.tag, l.{language}_text as translation
                FROM english e
                LEFT JOIN {language} l ON e.id = l.english_id
                ORDER BY e.id
            ''')
        
        data = {}
        total_count = 0
        exported_count = 0
        with_key_count = 0
        
        for row in cursor.fetchall():
            total_count += 1
            
            if language == 'english':
                english_id, content, key, tag = row
                translation = content
            else:
                english_id, content, key, tag, translation = row
            
            # 只导出有翻译内容且有key的记录
            if translation and translation.strip() and key and key.strip():
                exported_count += 1
                with_key_count += 1
                
                # 使用key作为键，翻译内容作为值
                data[key] = translation
        
        conn.close()
        
        stats = {
            'total': total_count,
            'exported': exported_count,
            'with_key': with_key_count
        }
        
        return jsonify({
            'success': True,
            'data': data,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@export_bp.route('/api/export', methods=['GET'])
def export_data():
    """导出所有语言数据"""
    try:
        db_path = db_config.get_current_db()
        
        # 获取激活的语言列表
        active_languages = []
        for lang in LANGUAGES:
            if get_language_activation_status(db_path, lang):
                active_languages.append(lang)
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取所有英文数据
        cursor.execute('''
            SELECT id, english_text, translation_key, tag
            FROM english
            ORDER BY id
        ''')
        
        data = {}
        for lang in active_languages:
            data[lang] = {}
        
        for row in cursor.fetchall():
            english_id, content, key, tag = row
            
            # 只处理有key的记录
            if not key or not key.strip():
                continue
                
            # 为每种语言添加数据
            for lang in active_languages:
                if lang == 'english':
                    translation = content
                else:
                    cursor.execute(f'''
                        SELECT {lang}_text FROM {lang} WHERE english_id = ?
                    ''', (english_id,))
                    result = cursor.fetchone()
                    translation = result[0] if result else None
                
                # 只导出有翻译内容且有key的记录
                if translation and translation.strip():
                    # 使用key作为键，翻译内容作为值
                    data[lang][key] = translation
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': data,
            'languages': active_languages
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
