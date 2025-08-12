from flask import Blueprint, request, jsonify
import sqlite3
import os
from models.database import db_config, init_db, add_operation_log

databases_bp = Blueprint('databases', __name__)

@databases_bp.route('/api/databases', methods=['GET'])
def get_databases():
    """获取数据库列表"""
    try:
        databases = db_config.get_available_databases()
        current_database = db_config.get_current_db()
        current_db_name = os.path.basename(current_database)
        
        # 确保当前数据库在列表中
        if current_db_name not in databases and os.path.exists(current_database):
            databases.append(current_db_name)
        
        return jsonify({
            'success': True,
            'databases': databases,
            'current_database': current_db_name
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@databases_bp.route('/api/databases', methods=['POST'])
def create_database():
    """创建新数据库"""
    try:
        data = request.get_json()
        db_name = data.get('name')
        
        if not db_name:
            return jsonify({'success': False, 'error': '数据库名称不能为空'}), 400
        
        # 验证数据库名称格式
        if not db_name.replace('_', '').replace('.', '').isalnum():
            return jsonify({'success': False, 'error': '数据库名称只能包含字母、数字和下划线'}), 400
        
        success, result = db_config.create_database(db_name)
        
        if success:
            # 初始化新数据库
            db_path = result
            init_db(db_path)
            
            # 记录操作日志
            add_operation_log(db_path, '新增', 1, f"创建新数据库: {db_name}")
            
            return jsonify({
                'success': True,
                'message': f'数据库 {db_name} 创建成功'
            })
        else:
            return jsonify({'success': False, 'error': result}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@databases_bp.route('/api/databases/switch', methods=['POST'])
def switch_database():
    """切换数据库"""
    try:
        data = request.get_json()
        db_name = data.get('name')
        
        if not db_name:
            return jsonify({'success': False, 'error': '数据库名称不能为空'}), 400
        
        # 检查数据库是否存在
        databases = db_config.get_available_databases()
        if db_name not in databases:
            return jsonify({'success': False, 'error': f'数据库 {db_name} 不存在'}), 404
        
        # 切换数据库
        db_config.set_current_db(db_name)
        
        return jsonify({
            'success': True,
            'message': f'已切换到数据库 {db_name}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@databases_bp.route('/api/init', methods=['POST'])
def initialize_database():
    """初始化数据库"""
    try:
        db_path = db_config.get_current_db()
        init_db(db_path)
        
        return jsonify({
            'success': True,
            'message': '数据库初始化成功'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
