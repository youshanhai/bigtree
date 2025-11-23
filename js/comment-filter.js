/**
 * Giscus 评论敏感词过滤器
 * 在用户提交评论前进行敏感词检测
 */

(function() {
  'use strict';

  // ==================== 配置区域 ====================

  // 敏感词列表 - 可根据需要自定义扩展
  const sensitiveWords = [
    // 政治敏感词示例
    '反动', '暴力', '恐怖',

    // 违规内容示例
    '赌博', '色情', '毒品',

    // 广告垃圾信息示例
    '代开发票', '办证', '贷款',

    // 辱骂词汇示例
    '傻逼', '草泥马', '你妈',

    // 可以继续添加更多敏感词...
  ];

  // 检测配置
  const config = {
    // 是否启用模糊匹配（检测变体，如：傻*逼、傻-逼）
    fuzzyMatch: true,

    // 是否区分大小写
    caseSensitive: false,

    // 提示消息
    alertMessage: '您的评论包含敏感词，请修改后重新提交！',

    // 是否显示具体的敏感词
    showMatchedWords: true,
  };

  // ==================== 核心功能 ====================

  /**
   * 构建敏感词正则表达式
   * 支持模糊匹配，可以检测到类似 "傻*逼"、"傻 逼" 这样的变体
   */
  function buildSensitiveRegex() {
    const pattern = sensitiveWords.map(word => {
      if (config.fuzzyMatch) {
        // 在每个字符之间插入可选的特殊字符匹配
        return word.split('').join('[\\s\\*\\-_\\.]*');
      }
      return word;
    }).join('|');

    const flags = config.caseSensitive ? 'g' : 'gi';
    return new RegExp(pattern, flags);
  }

  /**
   * 检测文本中的敏感词
   * @param {string} text - 待检测的文本
   * @returns {Array|null} - 匹配到的敏感词数组，没有则返回 null
   */
  function checkSensitiveWords(text) {
    if (!text || !text.trim()) {
      return null;
    }

    const regex = buildSensitiveRegex();
    const matches = text.match(regex);

    if (matches) {
      // 去重并返回
      return [...new Set(matches)];
    }

    return null;
  }

  /**
   * 显示敏感词提示
   * @param {Array} matches - 匹配到的敏感词列表
   */
  function showAlert(matches) {
    let message = config.alertMessage;

    if (config.showMatchedWords && matches && matches.length > 0) {
      message += '\n\n检测到的敏感词: ' + matches.join(', ');
    }

    alert(message);
  }

  /**
   * 为评论表单添加敏感词检测
   */
  function attachFilterToComment() {
    // 查找 Giscus 评论框
    const commentTextarea = document.querySelector('.giscus-comment-box textarea, .giscus textarea');

    if (!commentTextarea) {
      return false;
    }

    // 避免重复绑定
    if (commentTextarea.dataset.sensitiveFilterAttached === 'true') {
      return true;
    }

    // 查找提交按钮的父表单
    const form = commentTextarea.closest('form');

    if (form) {
      // 标记已绑定
      commentTextarea.dataset.sensitiveFilterAttached = 'true';

      // 监听表单提交事件（使用捕获阶段以确保最先执行）
      form.addEventListener('submit', function(e) {
        const content = commentTextarea.value;
        const sensitiveMatches = checkSensitiveWords(content);

        if (sensitiveMatches && sensitiveMatches.length > 0) {
          // 阻止表单提交
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          // 显示提示
          showAlert(sensitiveMatches);

          // 聚焦到输入框
          commentTextarea.focus();

          return false;
        }
      }, true); // 使用捕获阶段

      console.log('[敏感词过滤] 已启用评论敏感词检测');
      return true;
    }

    return false;
  }

  /**
   * 初始化敏感词过滤器
   * 使用 MutationObserver 监听 DOM 变化，因为 Giscus 是异步加载的
   */
  function initCommentFilter() {
    // 尝试直接绑定
    if (attachFilterToComment()) {
      return;
    }

    // 如果直接绑定失败，使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(function() {
      // 尝试绑定过滤器
      if (attachFilterToComment()) {
        // 绑定成功后可以选择停止观察（取消注释下一行）
        // observer.disconnect();
      }
    });

    // 开始观察整个 body 的子树变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[敏感词过滤] 开始监听 Giscus 评论框加载...');
  }

  // ==================== 入口 ====================

  /**
   * 页面加载完成后初始化
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommentFilter);
  } else {
    // DOM 已经加载完成，直接初始化
    initCommentFilter();
  }

  // 暴露到全局（可选，用于调试）
  window.CommentFilter = {
    check: checkSensitiveWords,
    addWord: function(word) {
      if (!sensitiveWords.includes(word)) {
        sensitiveWords.push(word);
        console.log('[敏感词过滤] 已添加敏感词:', word);
      }
    },
    removeWord: function(word) {
      const index = sensitiveWords.indexOf(word);
      if (index > -1) {
        sensitiveWords.splice(index, 1);
        console.log('[敏感词过滤] 已移除敏感词:', word);
      }
    },
    listWords: function() {
      console.log('[敏感词过滤] 当前敏感词列表:', sensitiveWords);
      return sensitiveWords;
    }
  };

})();
