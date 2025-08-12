from flask import Blueprint, request, jsonify
import sqlite3
import os
from models.database import db_config, add_operation_log, get_language_activation_status, LANGUAGES

translations_bp = Blueprint('translations', __name__)

@translations_bp.route('/api/translations', methods=['GET'])
def get_translations():
    """获取翻译数据"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        tag = request.args.get('tag')
        language = request.args.get('language')
        
        offset = (page - 1) * limit
        
        db_path = db_config.get_current_db()
        
        # 检查数据库文件是否存在，如果不存在则让get_current_db自动创建
        if not os.path.exists(db_path):
            db_path = db_config.get_current_db()
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 构建查询条件
        where_conditions = []
        params = []
        
        if tag and tag != 'all':
            where_conditions.append("e.tag = ?")
            params.append(tag)
        
        where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # 获取总数
        count_query = f"SELECT COUNT(*) FROM english e{where_clause}"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]
        
        # 获取英文数据
        query = f"""
            SELECT e.id, e.english_text, e.translation_key, e.tag, e.created_at, e.updated_at
            FROM english e{where_clause}
            ORDER BY e.id DESC
            LIMIT ? OFFSET ?
        """
        cursor.execute(query, params + [limit, offset])
        
        translations = []
        for row in cursor.fetchall():
            english_id, content, key, tag, created_at, updated_at = row
            
            # 获取所有语言的翻译
            translations_dict = {}
            tags_list = [tag] if tag else []
            
            # 获取激活的语言列表
            active_languages = []
            for lang in LANGUAGES:
                if get_language_activation_status(db_path, lang):
                    active_languages.append(lang)
            
            for lang in active_languages:
                if lang == 'english':
                    translations_dict[lang] = content
                else:
                    cursor.execute(f'''
                        SELECT {lang}_text FROM {lang} WHERE english_id = ?
                    ''', (english_id,))
                    result = cursor.fetchone()
                    translations_dict[lang] = result[0] if result else None
            
            # 如果指定了特定语言，只返回该语言的翻译
            if language and language in translations_dict:
                filtered_translations = {language: translations_dict[language]}
            else:
                filtered_translations = translations_dict
            
            translation_data = {
                'english_id': english_id,
                'english': content,
                'key': key,
                'tag': tag,
                'tags': tags_list,
                'translations': filtered_translations,
                'created_at': created_at,
                'updated_at': updated_at
            }
            
            translations.append(translation_data)
        
        conn.close()
        
        # 计算分页信息
        has_more = (page * limit) < total_count
        
        return jsonify({
            'success': True,
            'translations': translations,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'has_more': has_more
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@translations_bp.route('/api/translations', methods=['POST'])
def add_translation():
    """添加翻译"""
    try:
        data = request.get_json()
        english = data.get('english')
        key = data.get('key', '')
        tag = data.get('tag', '')
        translations = data.get('translations', {})
        
        if not english:
            return jsonify({'success': False, 'error': '英文内容不能为空'}), 400
        
        db_path = db_config.get_current_db()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 插入英文内容
        cursor.execute('''
            INSERT INTO english (english_text, translation_key, tag)
            VALUES (?, ?, ?)
        ''', (english, key, tag))
        
        english_id = cursor.lastrowid
        
        # 插入各语言翻译
        for lang, content in translations.items():
            if content and lang != 'english':
                cursor.execute(f'''
                    INSERT INTO {lang} (english_id, {lang}_text, translation_key)
                    VALUES (?, ?, ?)
                ''', (english_id, content, key))
        
        conn.commit()
        conn.close()
        
        # 记录操作日志
        add_operation_log(db_path, '新增', 1, f"新增翻译: {english[:50]}...")
        
        return jsonify({'success': True, 'message': '翻译添加成功'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@translations_bp.route('/api/translations/<int:english_id>', methods=['PUT'])
def update_translation(english_id):
    """更新翻译"""
    try:
        data = request.get_json()
        english = data.get('english')
        key = data.get('key', '')
        tag = data.get('tag', '')
        translations = data.get('translations', {})
        
        if not english:
            return jsonify({'success': False, 'error': '英文内容不能为空'}), 400
        
        db_path = db_config.get_current_db()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 更新英文内容
        cursor.execute('''
            UPDATE english 
            SET english_text = ?, translation_key = ?, tag = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (english, key, tag, english_id))
        
        # 更新各语言翻译
        for lang, content in translations.items():
            if lang != 'english':
                # 检查是否已存在翻译
                cursor.execute(f'''
                    SELECT id FROM {lang} WHERE english_id = ?
                ''', (english_id,))
                
                if cursor.fetchone():
                    # 更新现有翻译
                    cursor.execute(f'''
                        UPDATE {lang} 
                        SET {lang}_text = ?, translation_key = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE english_id = ?
                    ''', (content, key, english_id))
                else:
                    # 插入新翻译
                    cursor.execute(f'''
                        INSERT INTO {lang} (english_id, {lang}_text, translation_key)
                        VALUES (?, ?, ?)
                    ''', (english_id, content, key))
        
        conn.commit()
        conn.close()
        
        # 记录操作日志
        add_operation_log(db_path, '更新', 1, f"更新翻译: {english[:50]}...")
        
        return jsonify({'success': True, 'message': '翻译更新成功'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@translations_bp.route('/api/translations/<int:english_id>', methods=['DELETE'])
def delete_translation(english_id):
    """删除翻译"""
    try:
        db_path = db_config.get_current_db()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取英文内容用于日志
        cursor.execute('SELECT english_text FROM english WHERE id = ?', (english_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({'success': False, 'error': '翻译不存在'}), 404
        
        english_content = result[0]
        
        # 删除英文记录（级联删除所有翻译）
        cursor.execute('DELETE FROM english WHERE id = ?', (english_id,))
        
        conn.commit()
        conn.close()
        
        # 记录操作日志
        add_operation_log(db_path, '删除', 1, f"删除翻译: {english_content[:50]}...")
        
        return jsonify({'success': True, 'message': '翻译删除成功'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@translations_bp.route('/api/search', methods=['GET'])
def search_translations():
    """搜索翻译"""
    try:
        query = request.args.get('q', '')
        tag = request.args.get('tag')
        language = request.args.get('language')
        
        if not query:
            return jsonify({'success': False, 'error': '搜索关键词不能为空'}), 400
        
        db_path = db_config.get_current_db()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 构建搜索条件
        where_conditions = ["(e.english_text LIKE ? OR e.translation_key LIKE ?)"]
        params = [f'%{query}%', f'%{query}%']
        
        if tag and tag != 'all':
            where_conditions.append("e.tag = ?")
            params.append(tag)
        
        where_clause = " WHERE " + " AND ".join(where_conditions)
        
        # 搜索英文内容
        query_sql = f"""
            SELECT e.id, e.english_text, e.translation_key, e.tag, e.created_at, e.updated_at
            FROM english e{where_clause}
            ORDER BY e.id DESC
        """
        cursor.execute(query_sql, params)
        
        translations = []
        for row in cursor.fetchall():
            english_id, content, key, tag, created_at, updated_at = row
            
            # 获取所有语言的翻译
            translations_dict = {}
            tags_list = [tag] if tag else []
            
            # 获取激活的语言列表
            active_languages = []
            for lang in LANGUAGES:
                if get_language_activation_status(db_path, lang):
                    active_languages.append(lang)
            
            for lang in active_languages:
                if lang == 'english':
                    translations_dict[lang] = content
                else:
                    cursor.execute(f'''
                        SELECT {lang}_text FROM {lang} WHERE english_id = ?
                    ''', (english_id,))
                    result = cursor.fetchone()
                    translations_dict[lang] = result[0] if result else None
            
            # 如果指定了特定语言，只返回该语言的翻译
            if language and language in translations_dict:
                filtered_translations = {language: translations_dict[language]}
            else:
                filtered_translations = translations_dict
            
            translation_data = {
                'english_id': english_id,
                'english': content,
                'key': key,
                'tag': tag,
                'tags': tags_list,
                'translations': filtered_translations,
                'created_at': created_at,
                'updated_at': updated_at
            }
            
            translations.append(translation_data)
        
        conn.close()
        
        return jsonify({
            'success': True,
            'translations': translations
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
