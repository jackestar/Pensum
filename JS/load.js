let historyNav = () => {
    document.querySelectorAll("[data-url]").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const url = button.getAttribute("data-url");
    
            history.pushState({}, "", url);
    
            // Load the page
            const response = await fetch(url);
            if (response.ok) {
                const newContent = await response.text();
    
                // Extract response
                const parser = new DOMParser();
                const doc = parser.parseFromString(newContent, "text/html");
                const newPageContent = doc.querySelector("main").innerHTML;
    
                // Replace the content
                document.querySelector("main").innerHTML = newPageContent;
                historyNav();
            } else {
                console.error("Failed to load the page.");
            }
        });
    });
}

// Handle back/forward navigation
window.addEventListener("popstate", async e => {
    const url = location.pathname;

    // Fetch and update content when navigating back/forward
    const response = await fetch(url);
    if (response.ok) {
        const newContent = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(newContent, "text/html");
        const newPageContent = doc.querySelector("main").innerHTML;

        document.querySelector("main").innerHTML = newPageContent;
        historyNav();
    } else {
        console.error("Failed to load the page.");
    }
});
