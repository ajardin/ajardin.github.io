(function (document) {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('#sidebar');
    const checkbox = document.querySelector('#sidebar-checkbox');

    document.addEventListener('click', function (event) {
        const target = event.target;
        if (!checkbox.checked || sidebar.contains(target) || (target === checkbox || target === toggle)) {
            return;
        }

        checkbox.checked = false;
    }, false);

    if (document.querySelectorAll('.tag-list').length || document.querySelectorAll('.year-list').length) {
        executeFiltering();
        window.addEventListener('hashchange', function () {
            executeFiltering();
        });
    }
})(document);

function executeFiltering() {
    try {
        const currentHash = window.location.hash.substring(1);
        setActiveLink(currentHash);
        filterBlocks(currentHash);
    } catch (error) {
        console.error(error);
    }
}

function setActiveLink(selection) {
    if (selection === '') {
        return;
    }

    const links = document.querySelectorAll('.year-list a');
    for (link of links) {
        link.classList.contains(selection + '-link')
            ? link.classList.add('active-link')
            : link.classList.remove('active-link')
        ;
    }
}

function filterBlocks(selection) {
    if (selection === '') {
        return;
    }

    const blocks = document.querySelectorAll('.filterable-blocks div');
    for (let block of blocks) {
        block.classList.contains(selection + '-block')
            ? block.style.display = 'block'
            : block.style.display = 'none'
        ;
    }
}
