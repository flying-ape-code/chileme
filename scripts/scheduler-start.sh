#!/bin/bash

# 吃了么数据管理器 - 启动脚本
# 用途：启动定时任务调度器，每小时执行数据验证和备份

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="/Users/robin/chileme"
cd "$PROJECT_DIR"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否已经运行
check_running() {
    if pgrep -f "scripts/scheduler.js" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 启动调度器
start_scheduler() {
    log_info "启动定时任务调度器..."

    # 使用 nohup 在后台运行
    nohup node scripts/scheduler.js > logs/scheduler-output.log 2>&1 &
    local pid=$!

    # 等待一下，确保进程启动成功
    sleep 2

    if ps -p $pid > /dev/null; then
        echo $pid > logs/scheduler.pid
        log_info "✅ 调度器启动成功 (PID: $pid)"
        log_info "📝 输出日志: logs/scheduler-output.log"
        log_info "📋 PID 文件: logs/scheduler.pid"
        return 0
    else
        log_error "❌ 调度器启动失败"
        return 1
    fi
}

# 停止调度器
stop_scheduler() {
    log_info "停止定时任务调度器..."

    if [ -f logs/scheduler.pid ]; then
        local pid=$(cat logs/scheduler.pid)
        if kill $pid 2>/dev/null; then
            log_info "✅ 调度器已停止 (PID: $pid)"
            rm logs/scheduler.pid
        else
            log_warn "⚠️  进程不存在或已停止"
            rm logs/scheduler.pid
        fi
    else
        log_warn "⚠️  PID 文件不存在，尝试通过进程名查找..."
        pkill -f "scripts/scheduler.js" && log_info "✅ 调度器已停止" || log_warn "⚠️  没有找到运行中的调度器"
    fi
}

# 查看状态
status_scheduler() {
    if check_running; then
        log_info "🟢 调度器正在运行"
        if [ -f logs/scheduler.pid ]; then
            log_info "📋 PID: $(cat logs/scheduler.pid)"
        fi
    else
        log_warn "🔴 调度器未运行"
    fi
}

# 主函数
main() {
    # 确保日志目录存在
    mkdir -p logs

    local command=${1:-status}

    case $command in
        start)
            if check_running; then
                log_warn "⚠️  调度器已经在运行"
                status_scheduler
            else
                start_scheduler
            fi
            ;;
        stop)
            stop_scheduler
            ;;
        restart)
            stop_scheduler
            sleep 1
            start_scheduler
            ;;
        status)
            status_scheduler
            ;;
        run-once)
            log_info "手动执行一次数据验证和备份..."
            node scripts/crawler.js
            ;;
        *)
            echo "用法: $0 {start|stop|restart|status|run-once}"
            echo ""
            echo "命令说明:"
            echo "  start     - 启动定时任务调度器"
            echo "  stop      - 停止调度器"
            echo "  restart   - 重启调度器"
            echo "  status    - 查看调度器状态"
            echo "  run-once  - 手动执行一次数据验证和备份"
            echo ""
            echo "示例:"
            echo "  $0 start   # 启动调度器"
            echo "  $0 status  # 查看状态"
            echo "  $0 run-once  # 立即执行一次"
            exit 1
            ;;
    esac
}

main "$@"
