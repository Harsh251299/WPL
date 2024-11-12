<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $xmlData = $_POST['xmlData'];

    $filePath = 'userData.xml';

    if (!file_exists($filePath)) {
        // Create a new file with a root element if it doesn't exist
        file_put_contents($filePath, "<users>\n$xmlData\n</users>");
    } else {
        // Load the existing XML file and append new data before the closing </users> tag
        $existingData = file_get_contents($filePath);
        $newData = str_replace('</users>', "$xmlData\n</users>", $existingData);
        file_put_contents($filePath, $newData);
    }

    echo "XML data saved successfully!";
} else {
    echo "Invalid request method.";
}
?>
