from flask import Blueprint, request, jsonify
import sqlite3
import os
from models.database import db_config, LANGUAGES, get_language_activation_status, set_language_activation_status

languages_bp = Blueprint('languages', __name__)

@languages_bp.route('/api/languages', methods=['GET'])
def get_languages():
    """获取语言列表"""
    try:
        db_path = db_config.get_current_db()
        
        # 检查数据库文件是否存在，如果不存在则让get_current_db自动创建
        if not os.path.exists(db_path):
            db_path = db_config.get_current_db()
        
        # 获取激活的语言列表
        active_languages = []
        language_names = {}
        
        for lang in LANGUAGES:
            is_active = get_language_activation_status(db_path, lang)
            if is_active:
                active_languages.append(lang)
            
            # 语言名称映射
            language_names[lang] = {
                'zh': {
                    'english': '英文', 'chinese': '中文', 'thai': '泰语', 'czech': '捷克语',
                    'slovak': '斯洛伐克语', 'italian': '意大利语', 'polish': '波兰语',
                    'latin': '拉丁语', 'dutch': '荷兰语', 'portuguese': '葡萄牙语',
                    'greek': '希腊语', 'balkan': '巴尔干语', 'bulgarian': '保加利亚语',
                    'turkish': '土耳其语', 'french': '法语', 'german': '德语',
                    'ukrainian': '乌克兰语', 'russian': '俄语', 'south_african': '南非语',
                    'arabic': '阿拉伯语', 'norwegian': '挪威语', 'finnish': '芬兰语',
                    'macedonian': '马其顿语', 'estonian': '爱沙尼亚语', 'slovenian': '斯洛文尼亚语',
                    'indonesian': '印尼语', 'swedish': '瑞典语', 'japanese': '日语', 'korean': '韩语'
                },
                'en': {
                    'english': 'English', 'chinese': 'Chinese', 'thai': 'Thai', 'czech': 'Czech',
                    'slovak': 'Slovak', 'italian': 'Italian', 'polish': 'Polish',
                    'latin': 'Latin', 'dutch': 'Dutch', 'portuguese': 'Portuguese',
                    'greek': 'Greek', 'balkan': 'Balkan', 'bulgarian': 'Bulgarian',
                    'turkish': 'Turkish', 'french': 'French', 'german': 'German',
                    'ukrainian': 'Ukrainian', 'russian': 'Russian', 'south_african': 'South African',
                    'arabic': 'Arabic', 'norwegian': 'Norwegian', 'finnish': 'Finnish',
                    'macedonian': 'Macedonian', 'estonian': 'Estonian', 'slovenian': 'Slovenian',
                    'indonesian': 'Indonesian', 'swedish': 'Swedish', 'japanese': 'Japanese', 'korean': 'Korean'
                }
            }
        
        return jsonify({
            'success': True,
            'languages': active_languages,
            'language_names': language_names
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@languages_bp.route('/api/languages/remove', methods=['POST'])
def remove_language():
    """移除语言"""
    try:
        data = request.get_json()
        language = data.get('language')
        
        if not language:
            return jsonify({'success': False, 'error': '语言参数不能为空'}), 400
        
        if language == 'english':
            return jsonify({'success': False, 'error': '不能移除英文语言'}), 400
        
        db_path = db_config.get_current_db()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查语言表是否存在
        cursor.execute(f'''
            SELECT name FROM sqlite_master WHERE type='table' AND name='{language}'
        ''')
        
        if cursor.fetchone():
            # 删除语言表
            cursor.execute(f'DROP TABLE {language}')
            conn.commit()
        
        conn.close()
        
        # 设置语言为非激活状态
        set_language_activation_status(db_path, language, False)
        
        return jsonify({
            'success': True,
            'message': f'语言 {language} 已移除'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@languages_bp.route('/api/languages/toggle', methods=['POST'])
def toggle_language():
    """切换语言激活状态"""
    try:
        data = request.get_json()
        language = data.get('language')
        active = data.get('active', True)
        
        if not language:
            return jsonify({'success': False, 'error': '语言参数不能为空'}), 400
        
        if language == 'english':
            return jsonify({'success': False, 'error': '不能修改英文语言状态'}), 400
        
        db_path = db_config.get_current_db()
        
        if active:
            # 激活语言 - 创建语言表
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute(f'''
                CREATE TABLE IF NOT EXISTS {language} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    english_id INTEGER NOT NULL,
                    {language}_text TEXT,
                    translation_key TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (english_id) REFERENCES english (id) ON DELETE CASCADE
                )
            ''')
            
            conn.commit()
            conn.close()
            
            message = f'语言 {language} 已激活'
        else:
            # 停用语言 - 删除语言表
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute(f'DROP TABLE IF EXISTS {language}')
            conn.commit()
            conn.close()
            
            message = f'语言 {language} 已停用'
        
        # 更新语言激活状态
        set_language_activation_status(db_path, language, active)
        
        return jsonify({
            'success': True,
            'message': message
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
