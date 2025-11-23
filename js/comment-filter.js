/**
 * Giscus 评论敏感词过滤器
 * 在用户提交评论前进行敏感词检测
 */

(function() {
  'use strict';

  // ==================== 配置区域 ====================

  // 敏感词列表 - 从外部文件动态加载
  let sensitiveWords = [];

  // 敏感词文件路径
  const sensitiveWordsFilePath = '/js/sensitive-words.txt';

  // 检测配置
  const config = {
    // 是否启用模糊匹配（检测变体，如：傻*逼、傻-逼）
    fuzzyMatch: true,

    // 是否区分大小写
    caseSensitive: false,

    // 替换字符
    replaceChar: '*',

    // 是否显示替换提示
    showReplaceNotice: true,

    // 提示消息
    noticeMessage: '您的评论中包含敏感词，已自动替换为星号',
  };

  // ==================== 核心功能 ====================

  /**
   * 从外部文件加载敏感词
   * @returns {Promise<boolean>} - 加载成功返回 true，失败返回 false
   */
  async function loadSensitiveWords() {
    try {
      const response = await fetch(sensitiveWordsFilePath);

      if (!response.ok) {
        throw new Error(`加载敏感词文件失败: ${response.status}`);
      }

      const text = await response.text();

      // 解析逗号分隔的敏感词，过滤空白项
      sensitiveWords = text
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);

      console.log(`[敏感词过滤] 成功加载 ${sensitiveWords.length} 个敏感词`);
      return true;
    } catch (error) {
      console.error('[敏感词过滤] 加载敏感词失败:', error);
      // 加载失败时使用空数组，不影响页面其他功能
      sensitiveWords = [];
      return false;
    }
  }

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
   * 将文本中的敏感词替换为星号
   * @param {string} text - 待处理的文本
   * @returns {Object} - { replaced: boolean, text: string, matches: Array }
   */
  function replaceSensitiveWords(text) {
    if (!text || !text.trim() || sensitiveWords.length === 0) {
      return { replaced: false, text: text, matches: [] };
    }

    const regex = buildSensitiveRegex();
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
      // 替换所有敏感词为等长的星号
      const replacedText = text.replace(regex, (match) => {
        return config.replaceChar.repeat(match.length);
      });

      return {
        replaced: true,
        text: replacedText,
        matches: [...new Set(matches)]
      };
    }

    return { replaced: false, text: text, matches: [] };
  }

  /**
   * 显示替换提示
   * @param {Array} matches - 被替换的敏感词列表
   */
  function showNotice(matches) {
    if (!config.showReplaceNotice) {
      return;
    }

    let message = config.noticeMessage;

    if (matches && matches.length > 0) {
      console.log('[敏感词过滤] 已替换敏感词:', matches.join(', '));
    }

    // 使用一个不太突兀的提示方式
    // 可以根据实际需求选择 alert 或其他方式
    // alert(message);
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
        const result = replaceSensitiveWords(content);

        if (result.replaced) {
          // 阻止默认提交，先替换内容
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          // 更新输入框内容
          commentTextarea.value = result.text;

          // 显示提示
          showNotice(result.matches);

          // 触发 input 事件，确保 Giscus 能够检测到内容变化
          const inputEvent = new Event('input', { bubbles: true });
          commentTextarea.dispatchEvent(inputEvent);

          // 延迟一小段时间后重新提交表单
          setTimeout(() => {
            form.requestSubmit();
          }, 100);

          return false;
        }
        // 如果没有敏感词，正常提交
      }, true); // 使用捕获阶段

      console.log('[敏感词过滤] 已启用评论敏感词自动过滤');
      return true;
    }

    return false;
  }

  /**
   * 初始化敏感词过滤器
   * 使用 MutationObserver 监听 DOM 变化，因为 Giscus 是异步加载的
   */
  async function initCommentFilter() {
    // 首先加载敏感词文件
    await loadSensitiveWords();

    // 如果没有加载到敏感词，仍然继续执行，只是不会进行过滤
    if (sensitiveWords.length === 0) {
      console.warn('[敏感词过滤] 敏感词列表为空，过滤器将不生效');
    }

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
    replace: replaceSensitiveWords,
    reload: async function() {
      console.log('[敏感词过滤] 正在重新加载敏感词...');
      const success = await loadSensitiveWords();
      return success;
    },
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
