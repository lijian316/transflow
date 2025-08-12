from flask import Blueprint, request, jsonify
import sqlite3
import os
from models.database import db_config, add_operation_log, get_operation_logs

tags_bp = Blueprint('tags', __name__)

@tags_bp.route('/api/tags', methods=['GET'])
def get_tags():
    """获取标签列表"""
    try:
        db_path = db_config.get_current_db()
        
        # 检查数据库文件是否存在，如果不存在则让get_current_db自动创建
        if not os.path.exists(db_path):
            db_path = db_config.get_current_db()
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT name FROM tags ORDER BY name')
        tags = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'tags': tags
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tags_bp.route('/api/tags', methods=['POST'])
def create_tag():
    """创建标签"""
    try:
        data = request.get_json()
        tag_name = data.get('name')
        
        if not tag_name:
            return jsonify({'success': False, 'error': '标签名称不能为空'}), 400
        
        db_path = db_config.get_current_db()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查标签是否已存在
        cursor.execute('SELECT id FROM tags WHERE name = ?', (tag_name,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'error': '标签已存在'}), 400
        
        # 创建标签
        cursor.execute('INSERT INTO tags (name) VALUES (?)', (tag_name,))
        conn.commit()
        conn.close()
        
        # 记录操作日志
        add_operation_log(db_path, '新增标签', 1, f"创建标签: {tag_name}")
        
        return jsonify({
            'success': True,
            'message': '标签创建成功'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tags_bp.route('/api/tags/<tag_name>/info', methods=['GET'])
def get_tag_info(tag_name):
    """获取标签信息"""
    try:
        db_path = db_config.get_current_db()
        
        # 检查数据库文件是否存在，如果不存在则让get_current_db自动创建
        if not os.path.exists(db_path):
            db_path = db_config.get_current_db()
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取使用该标签的翻译数量
        cursor.execute('SELECT COUNT(*) FROM english WHERE tag = ?', (tag_name,))
        translation_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'translation_count': translation_count
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tags_bp.route('/api/tags/<tag_name>', methods=['DELETE'])
def delete_tag(tag_name):
    """删除标签"""
    try:
        db_path = db_config.get_current_db()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取使用该标签的翻译数量
        cursor.execute('SELECT COUNT(*) FROM english WHERE tag = ?', (tag_name,))
        translation_count = cursor.fetchone()[0]
        
        # 删除标签
        cursor.execute('DELETE FROM tags WHERE name = ?', (tag_name,))
        
        # 清除使用该标签的翻译的标签字段
        cursor.execute('UPDATE english SET tag = NULL WHERE tag = ?', (tag_name,))
        
        conn.commit()
        conn.close()
        
        # 记录操作日志
        add_operation_log(db_path, '删除标签', translation_count, f"删除标签: {tag_name}")
        
        return jsonify({
            'success': True,
            'message': '标签删除成功'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tags_bp.route('/api/logs', methods=['GET'])
def get_logs():
    """获取操作日志"""
    try:
        limit = int(request.args.get('limit', 10))
        db_path = db_config.get_current_db()
        
        # 检查数据库文件是否存在
        if not os.path.exists(db_path):
            return jsonify({
                'success': True,
                'logs': []
            })
        
        logs = get_operation_logs(db_path, limit)
        
        return jsonify({
            'success': True,
            'logs': logs
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
