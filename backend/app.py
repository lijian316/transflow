from flask import Flask
from flask_cors import CORS
from models.database import init_db, db_config
from routes import translations, databases, languages, tags, export

def create_app():
    """创建Flask应用"""
    app = Flask(__name__)
    CORS(app)
    
    # 注册蓝图
    app.register_blueprint(translations.translations_bp)
    app.register_blueprint(databases.databases_bp)
    app.register_blueprint(languages.languages_bp)
    app.register_blueprint(tags.tags_bp)
    app.register_blueprint(export.export_bp)
    
    # 初始化数据库
    with app.app_context():
        init_db()
    
    return app

# 创建应用实例
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
