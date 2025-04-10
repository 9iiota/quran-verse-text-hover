const quranReferenceRegex = /([1-9]\d{0,2}):([1-9]\d{0,2})(?:-([1-9]\d{0,2}))?/g;
const testttttttt = /((\d{0,2}):([1-9]\d{0,2})(?:-([1-9]\d{0,2}))?)/g;
const footNoteRegex = /<(?!br|\ba href\b|\/)[^>]*>((?!>).)*<[^>]*>/g;

const popup = document.createElement('div');
popup.className = 'quran-popup';
document.body.appendChild(popup);

let isRightCtrlPressed = false;
let quranReference = '';
let popupText = null;

document.addEventListener('keydown', (event) =>
{
    if (event.code === 'ControlRight' && !isRightCtrlPressed)
    {
        isRightCtrlPressed = true;
    }
});
document.addEventListener('keyup', (event) =>
{
    if (event.code === 'ControlRight' && isRightCtrlPressed)
    {
        isRightCtrlPressed = false;
    }
});
let lastHighlightedSpan = null;
let lastHighlightedCharacters = null;

document.addEventListener('mousemove', (event) =>
{
    if (isRightCtrlPressed)
    {
        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
        if (hoveredElement)
        {
            const { found, rect } = isHoveringOverText(hoveredElement, event.clientX, event.clientY);
            if (found)
            {
                const range = document.caretRangeFromPoint(event.clientX, event.clientY);
                if (range && range.startContainer.nodeType === Node.TEXT_NODE)
                {
                    const textNode = range.startContainer;

                    // Use the helper function to get the full text
                    const fullText = getFullTextFromHover(textNode);
                    console.log(`Full Text: ${fullText}`);

                    const offset = range.startOffset; // Current index of the letter
                    const character = fullText[offset]; // Current character
                    console.log(`Exact letter: ${character}`);

                    const nextLetters = fullText.slice(offset + 1, offset + 7);
                    console.log(`Next 6 letters: ${nextLetters}`);

                    let joe = testttttttt.exec(nextLetters);
                    if (joe)
                    {
                        character += joe[0];
                    }

                    if (character !== lastHighlightedCharacters)
                    {
                        lastHighlightedCharacters = character;

                        // Highlight the letter
                        clearLastHighlight();
                        highlightLetter(textNode, offset);
                    }

                    // Process Quran reference
                    const matches = quranReferenceRegex.exec(fullText);
                    if (matches)
                    {
                        const chapter = matches[1];
                        const verseStart = parseInt(matches[2]);
                        const verseEnd = parseInt(matches[3]);

                        // Validate references
                        if (
                            chapter < 1 || chapter > 114 ||
                            verseStart < 1 || verseStart > 286 ||
                            (verseEnd && verseEnd < verseStart)
                        )
                        {
                            return;
                        }

                        let _quranReference = verseEnd ? `${chapter}:${verseStart}-${verseEnd}` : `${chapter}:${verseStart}`;
                        if (_quranReference !== quranReference)
                        {
                            quranReference = _quranReference;

                            (async () =>
                            {
                                if (verseEnd)
                                {
                                    popupText = await fetchVerses(quranReference);
                                } else
                                {
                                    popupText = await fetchVerse(quranReference);
                                }

                                displayPopup(popupText, rect.right, rect.bottom + window.scrollY);
                            })();
                        } else
                        {
                            displayPopup(popupText, rect.right, rect.bottom + window.scrollY);
                        }
                    }
                }
            } else
            {
                clearLastHighlight();
                togglePopupVisibility();
            }
        }
    }
});

// Highlight a specific letter in a text node
function highlightLetter(textNode, offset)
{
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow'; // Customize this color
    span.textContent = textNode.nodeValue[offset];

    const newTextNode = document.createTextNode(textNode.nodeValue.slice(offset + 1));
    textNode.nodeValue = textNode.nodeValue.slice(0, offset);

    // Insert the span and remaining text back into the DOM
    textNode.parentNode.insertBefore(span, textNode.nextSibling);
    textNode.parentNode.insertBefore(newTextNode, span.nextSibling);

    lastHighlightedSpan = span; // Store for later removal
}

// Clear the last highlighted letter
function clearLastHighlight()
{
    if (lastHighlightedSpan)
    {
        const parent = lastHighlightedSpan.parentNode;
        parent.replaceChild(document.createTextNode(lastHighlightedSpan.textContent), lastHighlightedSpan);
        lastHighlightedSpan = null;
    }
}
document.addEventListener('mousedown', (event) =>
{
    if (event.button === 0)
    {
        hidePopupOnClick(event);
    }
});

popup.addEventListener('mouseenter', () => { showPopup() });
popup.addEventListener('mouseleave', () => { togglePopupVisibility(); });

function clearLastHighlight()
{
    if (lastHighlightedSpan)
    {
        const parent = lastHighlightedSpan.parentNode;
        parent.replaceChild(document.createTextNode(lastHighlightedSpan.textContent), lastHighlightedSpan);
        lastHighlightedSpan = null;
    }
}

function isHoveringOverText(element, x, y)
{
    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
    for (const textNode of textNodes)
    {
        const range = document.createRange();
        range.selectNodeContents(textNode);

        // Loop through all rects that correspond to parts of the text
        const rects = range.getClientRects();
        for (const rect of rects)
        {
            // Check if the mouse is over the text node
            if (
                x >= rect.left && x <= rect.right &&
                y >= rect.top && y <= rect.bottom
            )
            {
                return { found: true, rect };
            }
        }
    }

    return { found: false };
}

function getFullTextFromHover(textNode)
{
    const parent = textNode.parentNode;
    if (!parent)
    {
        return textNode.nodeValue;
    } // Fallback to the current node

    // Collect all text nodes within the parent
    const textNodes = Array.from(parent.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);

    // Combine their content
    return textNodes.map(node => node.nodeValue).join('');
}

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
            .map((translation, index) => `<a href='https://quran.com/${chapter}?startingVerse=${verseStart + index}' target='_blank' rel='noopener noreferrer'>${verseStart + index})</a> ${translation.text}`)
            .join('<br>')
            .replace(footNoteRegex, '');
    }
    catch (error)
    {
        console.error('Error:', error);
        return null;
    }
}

function displayPopup(text, x, y)
{
    popup.innerHTML = text;
    popup.style.display = 'block';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
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

function showPopup()
{
    popup.style.display = 'block';
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

function OpenInNewTabWinBrowser(url)
{
    const win = window.open(url, '_blank');
    win.focus();
}
