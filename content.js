const editingIFrame = document.querySelector('iframe.docs-texteventtarget-iframe');

const popup = document.createElement('div');
popup.style.position = 'absolute';
popup.style.backgroundColor = 'lightyellow';
popup.style.border = '1px solid black';
popup.style.padding = '5px';
popup.style.zIndex = 1000;
popup.style.display = 'none';
document.body.appendChild(popup);

let mouseX = 0;
let mouseY = 0;

addEventListener("mousemove", (event) =>
{
    mouseX = event.clientX;
    mouseY = event.clientY;
});

if (editingIFrame)
{
    editingIFrame.contentDocument.addEventListener("keydown", checkRightCtrlPressed, false);
}

function checkRightCtrlPressed(e)
{
    const { code } = e;
    if (code === 'ControlRight')
    {
        const hoveredElements = document.elementsFromPoint(mouseX, mouseY);

        // Only proceed if hovering over text elements (ignore non-text elements)
        if (hoveredElements) //&& hoveredElement.nodeType === Node.TEXT_NODE)
        {
            hoveredElements.forEach(element =>
            {
                if (element instanceof HTMLCanvasElement)
                {
                    console.log(element);
                }
            });
            return;
            console.log(hoveredElements);
            const { textContent } = hoveredElements;

            // Check if the text contains a colon
            if (textContent.includes(':'))
            {
                // Display the popup
                popup.textContent = "You hovered over text with a colon!";
                popup.style.left = `${element.pageX + 10}px`;
                popup.style.top = `${element.pageY + 10}px`;
                popup.style.display = 'block';
            } else
            {
                popup.style.display = 'none';
            }
        } else
        {
            popup.style.display = 'none';
        }
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