import sqlite3
import os
import glob
from datetime import datetime

# 支持的语言列表
LANGUAGES = [
    'english', 'chinese', 'thai', 'czech', 'slovak', 'italian', 'polish', 
    'latin', 'dutch', 'portuguese', 'greek', 'balkan', 'bulgarian', 'turkish', 
    'french', 'german', 'ukrainian', 'russian', 'south_african', 'arabic', 
    'norwegian', 'finnish', 'macedonian', 'estonian', 'slovenian', 'indonesian', 'swedish',
    'japanese', 'korean'
]

class DatabaseConfig:
    def __init__(self, db_dir='databases', default_db='default.db'):
        self.db_dir = db_dir
        self.current_db = os.path.join(db_dir, default_db)
    
    def get_current_db(self):
        # 检查当前数据库是否存在，如果不存在则尝试切换到其他可用数据库
        if not os.path.exists(self.current_db):
            available_dbs = self.get_available_databases()
            if available_dbs:
                # 切换到第一个可用的数据库
                self.current_db = os.path.join(self.db_dir, available_dbs[0])
            else:
                # 如果没有可用数据库，创建默认数据库并初始化
                self.current_db = os.path.join(self.db_dir, 'default.db')
                if not os.path.exists(self.db_dir):
                    os.makedirs(self.db_dir)
                # 初始化新创建的数据库
                init_db(self.current_db)
        
        return self.current_db
    
    def set_current_db(self, db_name):
        if not db_name.endswith('.db'):
            db_name += '.db'
        self.current_db = os.path.join(self.db_dir, db_name)
        return self.current_db
    
    def get_available_databases(self):
        """获取所有可用的数据库文件"""
        if not os.path.exists(self.db_dir):
            os.makedirs(self.db_dir)
        
        db_files = glob.glob(os.path.join(self.db_dir, '*.db'))
        return [os.path.basename(db) for db in db_files]
    
    def create_database(self, db_name):
        """创建新数据库"""
        if not db_name.endswith('.db'):
            db_name += '.db'
        
        if not os.path.exists(self.db_dir):
            os.makedirs(self.db_dir)
        
        db_path = os.path.join(self.db_dir, db_name)
        
        # 如果数据库已存在，返回错误
        if os.path.exists(db_path):
            return False, f"数据库 '{db_name}' 已存在"
        
        # 创建新数据库
        try:
            conn = sqlite3.connect(db_path)
            conn.close()
            return True, db_path
        except Exception as e:
            return False, str(e)

def init_language_activation_table(db_path):
    """初始化语言激活状态表"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 创建语言激活状态表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS language_activation (
            language TEXT PRIMARY KEY,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 初始化所有语言为激活状态
    for lang in LANGUAGES:
        cursor.execute('''
            INSERT OR IGNORE INTO language_activation (language, is_active) 
            VALUES (?, 1)
        ''', (lang,))
    
    conn.commit()
    conn.close()

def get_language_activation_status(db_path, language):
    """获取指定数据库和语言的激活状态"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 检查语言激活状态表是否存在，如果不存在则创建
    cursor.execute('''
        SELECT name FROM sqlite_master WHERE type='table' AND name='language_activation'
    ''')
    
    if not cursor.fetchone():
        init_language_activation_table(db_path)
    
    # 获取语言激活状态
    cursor.execute('''
        SELECT is_active FROM language_activation WHERE language = ?
    ''', (language,))
    
    result = cursor.fetchone()
    conn.close()
    
    return result[0] if result else True

def set_language_activation_status(db_path, language, is_active):
    """设置指定数据库和语言的激活状态"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 检查语言激活状态表是否存在，如果不存在则创建
    cursor.execute('''
        SELECT name FROM sqlite_master WHERE type='table' AND name='language_activation'
    ''')
    
    if not cursor.fetchone():
        init_language_activation_table(db_path)
    
    # 更新语言激活状态
    cursor.execute('''
        UPDATE language_activation 
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE language = ?
    ''', (is_active, language))
    
    conn.commit()
    conn.close()

def init_db(db_path=None):
    """初始化数据库"""
    if db_path is None:
        db_path = 'databases/default.db'
    
    # 确保数据库目录存在
    db_dir = os.path.dirname(db_path)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 创建英文表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS english (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            english_text TEXT NOT NULL,
            translation_key TEXT,
            tag TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 为每种语言创建翻译表
    for lang in LANGUAGES:
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS {lang} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                english_id INTEGER NOT NULL,
                {lang}_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (english_id) REFERENCES english (id) ON DELETE CASCADE
            )
        ''')
    
    # 创建标签表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建操作日志表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS operation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            operation_type TEXT NOT NULL,
            entry_count INTEGER DEFAULT 0,
            description TEXT,
            operation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 初始化语言激活状态表
    init_language_activation_table(db_path)
    
    conn.commit()
    conn.close()
    
    return True

def add_operation_log(db_path, operation_type, entry_count, description=""):
    """添加操作日志"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO operation_logs (operation_type, entry_count, description)
        VALUES (?, ?, ?)
    ''', (operation_type, entry_count, description))
    
    conn.commit()
    conn.close()

def get_operation_logs(db_path, limit=10):
    """获取操作日志"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT operation_type, entry_count, description, operation_date
        FROM operation_logs
        ORDER BY operation_date DESC
        LIMIT ?
    ''', (limit,))
    
    logs = []
    for row in cursor.fetchall():
        logs.append({
            'operation_type': row[0],
            'entry_count': row[1],
            'description': row[2],
            'operation_date': row[3]
        })
    
    conn.close()
    return logs

# 全局数据库配置实例
db_config = DatabaseConfig()
