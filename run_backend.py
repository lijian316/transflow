#!/usr/bin/env python3
"""
多语言翻译管理系统 - 后端启动文件
"""

import sys
import os

# 添加backend目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import app

if __name__ == '__main__':
    print("启动多语言翻译管理系统后端服务...")
    print("服务地址: http://localhost:5000")
    print("按 Ctrl+C 停止服务")
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n服务已停止")
    except Exception as e:
        print(f"启动失败: {e}")
        sys.exit(1)
