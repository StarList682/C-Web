function compileCode() {
    const code = document.getElementById('code').value;
    const inputField = document.getElementById('input');
    const input = inputField.value ? inputField.value : '';
    //console.log(input);
    // Check if the code contains std::cin and toggle input field visibility
    //const isCinRequired = code.includes('std::cin');
    // const isCinRequired = code.includes('cin');
    // inputField.style.display = isCinRequired ? 'block' : 'none';

    // Fetch API request to compile and run the code
    fetch('/compile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, input }),  // Only send input if std::cin is present
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                document.getElementById('output').textContent = `Error: ${data.error}`;
            } else {
                document.getElementById('output').textContent = data.output;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('output').textContent = 'An error occurred. Please try again.';
        });
}

// Warn the user when they try to leave/refresh the page (currently not preventing leaving, idk how to fix)
window.addEventListener('beforeunload', function (event) {
    const confirmationMessage = "Changes you made may not be saved.";

    event.returnValue = confirmationMessage;
    return confirmationMessage;
});
