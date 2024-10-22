const verseRegex = /([1-9]{1,3}):([1-9]{1,3})/g;
const versesRegex = /(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?/g;
const footNoteRegex = /<(?!br|\ba href\b|\/)[^>]*>((?!>).)*<[^>]*>/g;

const popup = document.createElement('div');
popup.className = 'quran-popup';
document.body.appendChild(popup);

let isRightCtrlPressed = false;
let key = null;
let mouseX = 0;
let mouseY = 0;
let popupText = null;

document.addEventListener('keydown', (event) =>
{
    if (event.code === 'ControlRight')
    {
        isRightCtrlPressed = true;
    }
});
document.addEventListener('keyup', (event) =>
{
    if (event.code === 'ControlRight')
    {
        isRightCtrlPressed = false;
    }
});

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

                showPopup(popupText, event.pageX, event.pageY);
            }
        }
        else
        {
            togglePopupVisibility();
        }
    }
});

popup.addEventListener('mouseenter', () =>
{
    popup.style.display = 'block';
});
popup.addEventListener('mouseleave', () =>
{
    togglePopupVisibility();
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
    fetch(`https://api.quran.com/api/v4/quran/translations/20?verse_key=${verseKey}`)
        .then((response) => response.json())
        .then((data) =>
        {
            const translation = data.translations[0].text;
            const text = translation.replace(footNoteRegex, '');
            popupText = text;
        })
        .catch((error) => console.error('Error:', error));
}

function fetchVerses(test)
{
    const chapter = parseInt(test.split(':')[0]);
    const verseStart = parseInt(test.split('-')[0].split(':')[1]);
    const verseEnd = parseInt(test.split('-')[1]);

    fetch(`https://api.quran.com/api/v4/quran/translations/20?chapter_number=${chapter}`)
        .then((response) => response.json())
        .then((data) =>
        {
            const { translations } = data;
            const versesCount = verseEnd - verseStart + 1;

            const output = translations
                .slice(verseStart - 1, verseStart - 1 + versesCount)
                .map((translation, index) => `<a href='https://quran.com/${chapter}?startingVerse=${verseStart + index}'>${verseStart + index}) ${translation.text}</a>`)
                .join('<br>')
                .replace(footNoteRegex, '');

            console.log(output);
            popupText = output;
        })
        .catch((error) => console.error('Error:', error));
}

function showPopup(text, x, y)
{
    popup.innerHTML = text;
    popup.style.left = `${x + 10}px`;
    popup.style.top = `${y + 10}px`;
    popup.style.display = 'block';
}

function togglePopupVisibility()
{
    if (popup.style.display === 'block')
    {
        popup.style.display = 'none';
    }
    else
    {
        popup.style.display = 'block';
    }
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