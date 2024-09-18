const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/compile', (req, res) => {
    const code = req.body.code;
    const userInput = req.body.input;
    const filename = path.join(__dirname, 'temp.cpp');  // Cross-platform compatibility
    const executable = path.join(__dirname, 'temp');    // Output file path
    const inputFile = path.join(__dirname, 'temp_input.txt');

    try {
        // Cleanup old files
        [filename, executable, inputFile].forEach(file => {
            if (fs.existsSync(file)) fs.unlinkSync(file);
        });

        // Write C++ code to a file
        fs.writeFileSync(filename, code);

        // Only write input to a file if needed
        if (userInput) fs.writeFileSync(inputFile, userInput);

        // Wrap file paths in quotes for cross-platform compatibility
        exec(`g++ "${filename}" -o "${executable}"`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Compilation Error: ${stderr}`);
                return res.status(500).json({ error: `Compilation Error: ${stderr}` });
            }

            console.log(`Compilation successful: ${stdout}`);

            // Run the executable with or without input redirection
            const command = userInput
                ? `"${executable}" < "${inputFile}"`
                : `"${executable}"`;

            console.log(`Running command: ${command}`);

            exec(command, (err, stdout, stderr) => {
                // Cleanup after execution
                [filename, executable, inputFile].forEach(file => {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                });

                if (err) {
                    console.error(`Runtime Error: ${stderr}`);
                    return res.status(500).json({ error: `Runtime Error: ${stderr}` });
                }

                console.log(`Execution successful: ${stdout}`);
                res.json({ output: stdout });
            });
        });
    } catch (error) {
        console.error(`Unexpected Error: ${error.message}`);
        res.status(500).json({ error: `Unexpected Error: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
