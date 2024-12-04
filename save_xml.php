<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $xmlData = $_POST['xmlData'];

    $filePath = 'commentData.xml';

    if (!file_exists($filePath)) {
        // Create a new file with a root element if it doesn't exist
        file_put_contents($filePath, "<commentsData>\n$xmlData\n</commentsData>");
    } else {
        // Load the existing XML file and append new data before the closing </commentsData> tag
        $existingData = file_get_contents($filePath);
        $newData = str_replace('</commentsData>', "$xmlData\n</commentsData>", $existingData);
        file_put_contents($filePath, $newData);
    }

    echo "XML data saved successfully!";
} else {
    echo "Invalid request method.";
}
?>
