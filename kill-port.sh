#!/bin/bash
# 清理占用 4000 端口的进程

echo "🔍 检查 4000 端口占用情况..."

# 查找占用 4000 端口的进程
PORT_PID=$(lsof -ti:4000)

if [ -z "$PORT_PID" ]; then
    echo "✅ 4000 端口当前未被占用"
else
    echo "⚠️  发现进程占用 4000 端口: $PORT_PID"
    echo "正在终止进程..."
    kill -9 $PORT_PID
    sleep 1

    # 再次检查
    if lsof -ti:4000 > /dev/null 2>&1; then
        echo "❌ 进程终止失败"
        exit 1
    else
        echo "✅ 4000 端口已成功释放"
    fi
fi

# 同时清理所有 hexo server 进程
echo ""
echo "🔍 检查其他 hexo server 进程..."
HEXO_PIDS=$(pgrep -f "hexo.*server")

if [ -z "$HEXO_PIDS" ]; then
    echo "✅ 没有其他 hexo server 进程"
else
    echo "⚠️  发现 hexo server 进程: $HEXO_PIDS"
    echo "正在终止所有 hexo server 进程..."
    pkill -9 -f "hexo.*server"
    sleep 1
    echo "✅ 已清理所有 hexo server 进程"
fi

echo ""
echo "🎉 清理完成！现在可以运行 hexo server 了"
