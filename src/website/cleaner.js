function handleRemoval(element) {
    for (const attribute of element.attributes) {
        const { name, value } = attribute;
        if (name.includes("grammarly") || value.includes("grammarly") ||
            name.includes("shoop") || value.includes("shoop")) {
            element.remove();
            console.log(`removed: ${element.tagName}`);
        }
    }
}

const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Handle added nodes
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === 1) { // Check if it's an element node
                    handleRemoval(node);
                }
            });
        }
    }
});

observer.observe(document, { childList: true, subtree: true });