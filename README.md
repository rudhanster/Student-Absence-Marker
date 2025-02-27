# Student-Absence-Marker
# Student Absence Marker Chrome Extension

A Chrome extension that helps teachers and educators mark student absences by automatically unticking checkboxes for absent students based on their enrollment IDs for SLCM 2.0.

## Features

- Quickly mark multiple absent students with a single action
- Works with student enrollment IDs to accurately identify students
- Provides immediate visual feedback on marking results
- Draggable panel interface that can be toggled on and off
- Saves previously entered IDs for convenience
- Compatible with SLCM 2.0

## Installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now appear in your toolbar

## How to Use

1. Navigate to your school's attendance page
2. Click the extension icon in your browser toolbar to open the panel
3. Enter the enrollment IDs of absent students (one per line, or separated by commas or spaces)
4. Click "Mark Absent"
5. The extension will find these students on the page and untick their attendance checkboxes
6. A status message will display the results of the operation

## Technical Details

The extension works by:
1. Searching the page content for the provided enrollment IDs
2. Finding checkboxes associated with those IDs
3. Unchecking the boxes and triggering the necessary events to ensure the changes are registered
4. Providing feedback on the number of students found and checkboxes modified

## Permissions

This extension requires the following permissions:
- `activeTab`: To interact with the current webpage
- `storage`: To save enrollment IDs for convenience between uses

## Compatibility

The extension is designed to work with most school management systems that use standard HTML checkboxes for attendance. It looks for enrollment IDs in various HTML elements and attempts to find associated checkboxes.

## Troubleshooting

If the extension doesn't work as expected:
1. Make sure the enrollment IDs are entered correctly
2. Ensure you're on the correct attendance page
3. Verify that the page uses standard HTML checkboxes for attendance
4. Check the browser console for any error messages

## Development

The extension consists of the following main components:
- `background.js`: Handles browser events and extension icon clicks
- `content.js`: Performs the actual page manipulations
- `panel.html` & `panel.js`: Implements the floating panel UI
- `panel-modal.js`: Manages the developer information modal

### Building and Testing
1. Make your changes to the source files
2. Load the unpacked extension in developer mode (as described in Installation)
3. Test your changes
4. Reload the extension if necessary using the refresh button on the extensions page

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Developed by Anirudhan Adukkathayar C, Assistant Professor, DSCA, MIT  
With courtesy to Dr. Chithra K

## License

[MIT License](LICENSE)

## Privacy Policy

This extension does not collect or transmit any user data. All processing is done locally within the browser, and any stored data (such as previously entered enrollment IDs) is kept within your browser's local storage.
