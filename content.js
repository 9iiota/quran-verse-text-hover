const quranReferenceRegex = /(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?/g;
const footNoteRegex = /<(?!br|\ba href\b|\/)[^>]*>((?!>).)*<[^>]*>/g;

const popup = document.createElement('div');
popup.className = 'quran-popup';
document.body.appendChild(popup);

let isRightCtrlPressed = false;
let quranReference = '';
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
    if (isRightCtrlPressed)
    {
        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
        if (hoveredElement)
        {
            const { textContent } = hoveredElement;

            // Check if the text contains a Qur'an reference
            let matches = quranReferenceRegex.exec(textContent);
            if (matches && matches.length > 0)
            {
                const chapter = matches[1]
                const verseStart = matches[2]
                const verseEnd = matches[3]

                let _quranReference = verseEnd ? `${chapter}:${verseStart}-${verseEnd}` : `${chapter}:${verseStart}`;
                if (_quranReference !== quranReference)
                {
                    quranReference = _quranReference;

                    (async () =>
                    {
                        if (verseEnd)
                        {
                            popupText = await fetchVerses(quranReference);
                        }
                        else
                        {
                            popupText = await fetchVerse(quranReference);
                        }

                        showPopup(popupText, event.clientX, event.clientY);
                    })();
                }
                else
                {
                    showPopup(popupText, event.clientX, event.clientY);
                }

            }
        }
        else
        {
            togglePopupVisibility();
        }
    }
});
document.addEventListener('mousedown', (event) =>
{
    if (event.button === 0)
    {
        hidePopupOnClick(event);
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

async function fetchVerse(verseKey)
{
    try
    {
        const response = await fetch(`https://api.quran.com/api/v4/quran/translations/20?verse_key=${verseKey}`);
        const data = await response.json();
        const translation = data.translations[0].text;

        const chapter = parseInt(verseKey.split(':')[0]);
        const verse = parseInt(verseKey.split(':')[1]);
        return `<a href='https://quran.com/${chapter}?startingVerse=${verse}'>${verse})</a> ${translation.replace(footNoteRegex, '')}`;
    }
    catch (error)
    {
        console.error('Error:', error);
        return null;
    }
}

async function fetchVerses(quranReference)
{
    const chapter = parseInt(quranReference.split(':')[0]);
    const verseStart = parseInt(quranReference.split('-')[0].split(':')[1]);
    const verseEnd = parseInt(quranReference.split('-')[1]);
    const versesCount = verseEnd - verseStart + 1;

    try
    {
        const response = await fetch(`https://api.quran.com/api/v4/quran/translations/20?chapter_number=${chapter}`);
        const data = await response.json();
        const { translations } = data;

        return translations
            .slice(verseStart - 1, verseStart - 1 + versesCount)
            .map((translation, index) => `<a href='https://quran.com/${chapter}?startingVerse=${verseStart + index}'>${verseStart + index})</a> ${translation.text}`)
            .join('<br>')
            .replace(footNoteRegex, '');
    }
    catch (error)
    {
        console.error('Error:', error);
        return null;
    }
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

function hidePopupOnClick(event)
{
    if (popup.style.display === 'block' && !popup.contains(event.target))
    {
        popup.style.display = 'none';
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