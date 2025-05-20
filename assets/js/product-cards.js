document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function () {
            document.querySelectorAll('.product-card.expanded').forEach(expandedCard => {
                expandedCard.classList.remove('expanded');
            });

            this.classList.toggle('expanded');
        });
    });
});
