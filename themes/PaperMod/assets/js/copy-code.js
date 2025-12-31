document.addEventListener('DOMContentLoaded', () => {
  // 为所有代码块添加复制按钮
  document.querySelectorAll('.chroma').forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.textContent = 'copy';
    
    // 点击复制逻辑
    button.addEventListener('click', () => {
      const code = block.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'copyied';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = 'copy';
          button.classList.remove('copied');
        }, 2000);
      });
    });
    
    block.appendChild(button);
  });
});