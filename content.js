const verseRegex = /([1-9]{1,3}):([1-9]{1,3})/;
const versesRegex = /(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?/g;

const popup = document.createElement('div');
popup.style.position = 'absolute';
popup.style.backgroundColor = '#6926D7';
// popup.style.border = '1px solid black';
// popup.style.padding = '5px';
// popup.style.zIndex = 1000;
popup.style.display = 'none';
document.body.appendChild(popup);

let isRightCtrlPressed = false;
let key = null;
let popupText = null;

document.addEventListener('keydown', (event) =>
{
    if (event.code === 'ControlRight')
    {
        isRightCtrlPressed = true;
        console.log('Ctrl pressed');
    }
});
document.addEventListener('keyup', (event) =>
{
    if (event.code === 'ControlRight')
    {
        isRightCtrlPressed = false;
        console.log('Ctrl released');
    }
});

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) =>
{
    mouseX = event.pageX;
    mouseY = event.pageY;

    if (isRightCtrlPressed)
    {
        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
        if (hoveredElement)
        {
            const { textContent } = hoveredElement;

            let matches = versesRegex.exec(textContent);
            if (matches && matches.length > 0)
            {
                let _key;
                const chapter = matches[1]
                const verseStart = matches[2]
                const verseEnd = matches[3]

                if (!verseEnd)
                {
                    _key = `${chapter}:${verseStart}`;
                }
                else
                {
                    _key = `${chapter}:${verseStart}-${verseEnd}`;
                }

                if (_key !== key)
                {
                    key = _key;
                    if (!verseEnd)
                    {
                        fetchVerse(key);
                    }
                    else
                    {
                        fetchVerses(key);
                    }
                }

                popup.innerHTML = popupText;
                popup.style.left = `${mouseX}px`;
                popup.style.top = `${mouseY}px`;
                popup.style.display = 'block';
                popup.style.color = 'black';
            }
            // let match;
            // while ((match = versesRegex.exec(textContent)) !== null)
            // {
            //     console.log("Full Match:", match[0]);  // The entire matched string
            //     console.log("Part 1:", match[1]);        // The first capturing group
            //     console.log("Part 2:", match[2]);        // The second capturing group
            //     console.log("Part 3:", match[3]);
            // }

            // if (matches && matches.length > 0)
            // {
            //     if (verseKey !== matches[0])
            //     {
            //         verseKey = matches[0];
            //         fetchVerse(verseKey);
            //     }

            //     // Display the popup
            //     popup.textContent = textContent;
            //     popup.style.left = `${event.pageX + 10}px`;
            //     popup.style.top = `${event.pageY + 10}px`;
            //     popup.style.display = 'block';
            //     popup.style.color = 'black';
            // } else
            // {
            //     popup.style.display = 'none';
            // }
        } else
        {
            popup.style.display = 'none';
        }
    }
    else
    {
        popup.style.display = 'none';
    }
});

// function checkRightCtrlPressed(e)
// {
//     const { code } = e;
//     if (code === 'ControlRight')
//     {
//         const hoveredElements = document.elementsFromPoint(mouseX, mouseY);

//         // Only proceed if hovering over text elements (ignore non-text elements)
//         if (hoveredElements) //&& hoveredElement.nodeType === Node.TEXT_NODE)
//         {
//             const canvasElement = elements.find(element => element instanceof HTMLCanvasElement);
//             console.log(canvasElement);
//             return;
//             const { textContent } = hoveredElements;

//             // Check if the text contains a colon
//             if (textContent.includes(':'))
//             {
//                 // Display the popup
//                 popup.textContent = "You hovered over text with a colon!";
//                 popup.style.left = `${element.pageX + 10}px`;
//                 popup.style.top = `${element.pageY + 10}px`;
//                 popup.style.display = 'block';
//             } else
//             {
//                 popup.style.display = 'none';
//             }
//         } else
//         {
//             popup.style.display = 'none';
//         }
//     }
// }

function fetchVerse(verseKey)
{
    const footNoteRegex = /<[^>]+>[^<]+<[^>]+>/g;

    fetch(`https://api.quran.com/api/v4/quran/translations/20?verse_key=${verseKey}`)
        .then((response) => response.json())
        .then((data) =>
        {
            const translation = data.translations[0].text;
            const text = translation.replace(footNoteRegex, '');
            console.log(text);

        })
        .catch((error) => console.error('Error:', error));
}

function fetchVerses(test)
{
    const chapter = test.split(':')[0];
    const verseStart = test.split('-')[0].split(':')[1];
    const verseEnd = test.split('-')[1];

    const footNoteRegex = /<[^>]+>[^<]+<[^>]+>/g;

    fetch(`https://api.quran.com/api/v4/quran/translations/20?chapter_number=${chapter}`)
        .then((response) => response.json())
        .then((data) =>
        {
            const { translations } = data;
            const versesCount = verseEnd - verseStart + 1;
            const joe = translations.splice(versesCount);
            const output = translations
                .map((translation, index) => `${index + parseInt(verseStart)}. ${translation.text}`)
                .join('<br>');
            console.log(output);

            popupText = output;

            // const translation = data.translations[0].text;
            // const text = translation.replace(footNoteRegex, '');
            // console.log(text);

        })
        .catch((error) => console.error('Error:', error));
}

// const popup = document.createElement('div');
// popup.style.position = 'absolute';
// popup.style.backgroundColor = 'lightyellow';
// popup.style.border = '1px solid black';
// popup.style.padding = '5px';
// popup.style.zIndex = 1000;
// popup.style.display = 'none';
// document.body.appendChild(popup);

// document.addEventListener('keydown', (event) =>
// {
//     if (event.code === 'ControlRight')
//     {
//         isRightCtrlPressed = true;
//         console.log('Ctrl pressed');
//     }
// });
// document.addEventListener('keyup', (event) =>
// {
//     if (event.code === 'ControlRight')
//     {
//         isRightCtrlPressed = false;
//         console.log('Ctrl released');
//     }
// });

// document.addEventListener('mousemove', (event) =>
// {
//     if (isRightCtrlPressed)
//     {
//         checkGoogleDocsHover(event);
//     } else
//     {
//         popup.style.display = 'none';
//     }
// });

// function checkGoogleDocsHover(event)
// {
//     // Access Google Docs iframe
//     const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
//     if (iframe)
//     {
//         const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

//         // Get the element at the mouse position inside the iframe
//         const hoveredElement = iframeDocument.elementFromPoint(event.clientX, event.clientY);

//         if (hoveredElement && hoveredElement.nodeType === Node.TEXT_NODE)
//         {
//             const textContent = hoveredElement.textContent;

//             // Check if the text contains a colon
//             if (textContent.includes(':'))
//             {
//                 // Display the popup
//                 popup.textContent = "You hovered over text with a colon!";
//                 popup.style.left = `${event.pageX + 10}px`;
//                 popup.style.top = `${event.pageY + 10}px`;
//                 popup.style.display = 'block';
//             } else
//             {
//                 popup.style.display = 'none';
//             }
//         } else
//         {
//             popup.style.display = 'none';
//         }
//     }
// }