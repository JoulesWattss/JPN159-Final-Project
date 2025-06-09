document.addEventListener("DOMContentLoaded", function () {
    const dropdownLinks = document.querySelectorAll('.dropdown-content a[data-option]');
    const responseMessage = document.getElementById('response-message');

    // Handle dropdown item clicks
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedOption = e.target.getAttribute('data-option');

            // Send POST request to Flask server
            fetch('/dropdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `option=${selectedOption}`
            })
            .then(response => response.json())
            .then(data => {
                // Display server response
                responseMessage.textContent = data.message;
            });
        });
    });
});
