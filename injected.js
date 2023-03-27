/**
 * Realiza um log com a mensagem informada.
 * @param {string} message Mensagem que será logada.
 */
function log(message = '') {
    console.log(message);
}

log('URL matched');
log('Script initiated...');

/**
 * Cria um elemento com o status da issue após ela ser visível na tela.
 * @param {Object} issue Objeto que representa a issue.
 */
async function createElementStatusAfterVisibleOnScreen(issue) {
    log(`createElementStatusAfterVisibleOnScreen ${issue.key}`);
    log(issue);

    const selector = `[data-issue-key="${issue.key}"] .ghx-row.ghx-end.ghx-items-container`;
    const element = await waitForElement(selector);

    if (element.querySelector('.ghx-issue-status')) {
        element.removeChild(element.querySelector('.ghx-issue-status'));
    }

    const statusElement = document.createElement('span');
    statusElement.classList.add('ghx-issue-status');
    statusElement.textContent = issue.statusName;
    element.insertAdjacentElement('afterbegin', statusElement);
}

/**
 * Aguarda um elemento ficar visível na tela.
 * @param {string} selector Seletor do elemento.
 * @param {number} timeout Tempo máximo de espera em milissegundos.
 * @returns {Promise<Element>} Promise que resolve com o elemento ou rejeita após o timeout.
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(checkInterval);
                resolve(element);
            } else if (Date.now() - startTime >= timeout) {
                clearInterval(checkInterval);
                reject(new Error(`Timeout waiting for element ${selector}`));
            }
        }, 100);
    });
}

(function (xhr) {
    log('Configure XMLHttpRequest');

    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;

    XHR.open = function (method, url) {
        log('XMLHttpRequest open');
        return open.apply(this, arguments);
    };

    XHR.send = function (postData) {
        log('XMLHttpRequest send');

        const self = this;
        self.addEventListener('load', async function () {
            log('XMLHttpRequest eventListener load');
            log(self);

            const response = JSON.parse(self.responseText);

            if (response && response.hasOwnProperty('issues')) {
                const issues = response.issues;

                log('XMLHttpRequest has issues');
                log(issues);

                // Aguarda cada elemento estar visível na tela antes de criar o status.
                for (const issue of issues) {
                    try {
                        createElementStatusAfterVisibleOnScreen(issue);
                    } catch (error) {
                        log(error.message);
                    }
                }
            }
        });
        send.apply(this, arguments);
    };
})(XMLHttpRequest);
