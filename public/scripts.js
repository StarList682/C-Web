function compileCode() {
    const code = document.getElementById('code').value;
    const inputField = document.getElementById('input');
    const input = inputField.value ? inputField.value: '';
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

const textareas = document.querySelectorAll('textarea');
        console.log(textareas);
        textareas.forEach(textarea => {
            textarea.addEventListener('keydown', function (event) {
                // Corresponding closing symbols
                const openingSymbols = {
                    '(': ')',
                    '{': '}',
                    '[': ']',
                };
                // Handle auto closing brackets (wasted 2 hours :D)
                if (openingSymbols[event.key]) {
                    const cursorPosition = textarea.selectionStart;
                    const lines = textarea.value.split('\n');

                    // Find which line the cursor is in
                    let currentLine = 0;
                    let charCount = 0;

                    for (let i = 0; i < lines.length; i++) {
                        charCount += lines[i].length + 1;

                        if (cursorPosition < charCount) {
                            currentLine = i;
                            break;
                        }
                    }

                    // Get the start and end index of the current line in the full textarea text
                    let lineStart = charCount - lines[currentLine].length - 1; // Start index of the line
                    let lineEnd = charCount - 1; // End index of the line

                    // Get the position of the cursor in the current line
                    let cursorInLinePosition = cursorPosition - lineStart;

                    // Get the text before and after the cursor in that line
                    const beforeCursor = lines[currentLine].substring(0, cursorInLinePosition);
                    const afterCursor = lines[currentLine].substring(cursorInLinePosition);

                    //console.log("Text before the cursor:", beforeCursor);
                    //console.log("Text after the cursor:", afterCursor);

                    const start = this.selectionStart;
                    const end = this.selectionEnd;

                    const openingSymbol = event.key, closingSymbol = openingSymbols[event.key];      // Openening and closing symbols
                    //console.log(openingSymbol, closingSymbol);

                    //Get the brackets before and after cursor in the line and the counts also(for no reason)
                    var beforeCursorOpeningCount = 0, beforeCursorOpeningCount = 0, afterCursorOpeningCount = 0, afterCursorOpeningCount = 0, before = "", after = "";
                    for (var i in beforeCursor) {
                        var character = beforeCursor[i];
                        //console.log(character, openingSymbol);
                        if (character == openingSymbol) {
                            beforeCursorOpeningCount++;
                            before += character;
                        }
                        else if (character == closingSymbol) {
                            beforeCursorOpeningCount--;
                            before += character;
                        }
                    }
                    for (var i in afterCursor) {
                        var character = afterCursor[i];
                        if (character == openingSymbol) {
                            afterCursorOpeningCount++;
                            after += character;
                        }
                        else if (character == closingSymbol) {
                            afterCursorOpeningCount--;
                            after += character;
                        }
                    }
                    //console.log(before, after);
                    if (after[0] != openingSymbol) {
                        event.preventDefault();

                        // Get the text before and after the cursor
                        const textBeforeCursor = this.value.substring(0, start);
                        const textAfterCursor = this.value.substring(start);

                        // Add the opening and closing symbols
                        this.value = textBeforeCursor + openingSymbol + closingSymbol + textAfterCursor;

                        // Move the cursor
                        this.selectionStart = this.selectionEnd = start + 1;
                    }
                }
                //Handle ' and "
                if (event.key == '"' || event.key == "'") {
                    event.preventDefault();

                    const start = this.selectionStart;
                    const end = this.selectionEnd;

                    // Insert the character two times
                    this.value = this.value.substring(0, start) + event.key + event.key + this.value.substring(end);

                    // Move the cursor after the inserted tab
                    this.selectionStart = this.selectionEnd = start + 1;
                }

                // Handle backspace for deleting paired symbols
                const pairableSymbols = {
                    '(': ')',
                    '{': '}',
                    '[': ']',
                    '"': '"',
                    "'": "'"
                };
                if (event.key === 'Backspace') {
                    const start = this.selectionStart;

                    // Only proceed if there is a character before the cursor
                    if (start > 0) {
                        const charBefore = this.value[start - 1];   // Character before cursor
                        const charAfter = this.value[start];        // Character after cursor

                        // Check if the character before and after the cursor are a matching pair
                        if (pairableSymbols[charBefore] && pairableSymbols[charBefore] === charAfter) {
                            event.preventDefault(); // Prevent default backspace behavior

                            // Remove both the opening and closing symbols
                            this.value = this.value.substring(0, start - 1) + this.value.substring(start + 1);

                            // Move the cursor back one position
                            this.selectionStart = this.selectionEnd = start + 1;
                        }
                    }
                }
            });
        });

        // Warn the user when they try to leave/refresh the page (currently not preventing leaving, idk how to fix)
        window.addEventListener('beforeunload', function (event) {
            const confirmationMessage = "Changes you made may not be saved.";

            event.returnValue = confirmationMessage;
            return confirmationMessage;
        });
