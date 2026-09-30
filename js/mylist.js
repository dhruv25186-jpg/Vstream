document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('mylist-results');
    const emptyState = document.getElementById('empty-list');
    
    function renderList() {
        const list = listManager.getList();
        
        resultsContainer.innerHTML = '';
        
        if (list.length === 0) {
            emptyState.style.display = 'block';
            resultsContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            resultsContainer.style.display = 'grid';
            
            list.reverse().forEach(item => {
                const card = createMovieCard(item, item.media_type);
                
                // Add remove button overlay
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.className = 'btn-icon';
                removeBtn.style.position = 'absolute';
                removeBtn.style.top = '10px';
                removeBtn.style.right = '10px';
                removeBtn.style.zIndex = '10';
                removeBtn.style.background = 'rgba(0,0,0,0.7)';
                
                removeBtn.onclick = (e) => {
                    e.stopPropagation(); // prevent navigation
                    listManager.remove(item.id);
                    renderList(); // re-render
                };
                
                card.appendChild(removeBtn);
                resultsContainer.appendChild(card);
            });
        }
    }
    
    renderList();
});
