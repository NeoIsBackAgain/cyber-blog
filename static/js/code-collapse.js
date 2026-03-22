document.addEventListener("DOMContentLoaded", function() {
    // Target Hugo's highlight wrappers inside your post content
    const codeBlocks = document.querySelectorAll('.post-content .highlight');
    const MAX_HEIGHT = 350; // Must match the max-height in your CSS

    codeBlocks.forEach(block => {
        // Hugo usually wraps the actual code in .chroma when syntax highlighting is on
        const innerContainer = block.querySelector('.chroma') || block.querySelector('pre');
        
        // If the code block is taller than our limit
        if (innerContainer && innerContainer.scrollHeight > MAX_HEIGHT) {
            
            // 1. Add the collapsed class
            block.classList.add('code-collapsed');

            // 2. Create the button
            const expandBtn = document.createElement('button');
            expandBtn.className = 'code-expand-btn';
            expandBtn.innerText = 'Show More';

            // 3. Add the button to the main wrapper
            block.appendChild(expandBtn);

            // 4. Listen for clicks
            expandBtn.addEventListener('click', () => {
                block.classList.toggle('code-collapsed');
                
                if (block.classList.contains('code-collapsed')) {
                    expandBtn.innerText = 'Show More';
                    // Scroll back up so the user doesn't lose their place when it collapses
                    block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    expandBtn.innerText = 'Show Less';
                }
            });
        }
    });
});