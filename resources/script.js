/**
 * Função que obtém o ID do board.
 */
function getRapidViewId() {
    return new URL(window.location.href).pathname.split('/').slice(-2, -1)[0];
}

/**
 * Realiza um log com a mensagem informada.
 * @param {string} message Mensagem que será logada.
 */
function debug(message = '') {
    //  console.log(message);
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
                console.log(`Timeout waiting for element ${selector}`);
            }
        }, 100);
    });
}

/**
 * Função que obtém as issues da board.
 * @returns {Promise<Object>} Promise que resolve com o JSON das issues ou rejeita em caso de erro.
 */
async function getIssuesFromBoard() {
    try {
        const urlbase = '/rest/greenhopper/1.0/xboard/plan/v2/backlog/data?rapidViewId={rapidViewId}&forceConsistency=true';
        const urlIssues = urlbase.replace('{rapidViewId}', getRapidViewId());
        debug(urlIssues);
        const response = await fetch(urlIssues);
        return response.json();
    } catch (error) {
        console.error(error);
    }
}

/**
 * Função que cria um elemento com o status da issue após ela ser visível na tela.
 * @param {Object} issue Objeto que representa a issue.
 */
async function createElementStatusAfterVisibleOnScreen(issue) {
    try {
        debug(`createElementStatusAfterVisibleOnScreen ${issue.key}`);
        debug(issue);
        const selector = `[data-issue-key="${issue.key}"] .ghx-row.ghx-end.ghx-items-container`;
        const element = await waitForElement(selector);
        if (element.querySelector('.ghx-issue-status-extension')) {
            element.removeChild(element.querySelector('.ghx-issue-status-extension'));
        }
        const statusElement = document.createElement('span');
        statusElement.classList.add('ghx-issue-status-extension');
        statusElement.classList.add(issue.status.statusCategory.colorName);
        statusElement.classList.add(getSiteTheme());
        statusElement.textContent = issue.statusName;
        element.insertAdjacentElement('afterbegin', statusElement);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Obtem o tema do site
 * @returns {null|string}
 */
function getSiteTheme() {
    const htmlElement = document.querySelector('html');
    const themeAttribute = htmlElement.getAttribute('data-theme');
    const themes = themeAttribute.split(' ');
    const colorMode = htmlElement.getAttribute('data-color-mode');

    for (let i = 0; i < themes.length; i++) {
        const [theme, value] = themes[i].split(':');
        if (colorMode === value) {
            return theme;
        }
    }

    return null;
}

/**
 *
 * Valida se a pagina é do backlog
 * @returns {boolean}
 */
function validaBackLogPage() {
    const padrao = /^https:\/\/.*\.atlassian\.net\/jira\/software\/c\/projects\/.*\/boards\/.*\/backlog\?.*$/;
    return padrao.test(window.location.href);
}


/**
 * Função que configura o XMLHttpRequest.
 */
(function (xhr) {
    debug('Configure XMLHttpRequest');

    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;

    XHR.open = function (method, url) {
        debug('XMLHttpRequest open');
        return open.apply(this, arguments);
    };

    XHR.send = function (postData) {
        debug('XMLHttpRequest send');

        const self = this;
        self.addEventListener('load', async function () {
            debug('XMLHttpRequest eventListener load');
            debug(self);

            if (
                !validaBackLogPage() ||                                                           // no backlog page
                (
                    self.responseURL.indexOf('storeMode?mode=plan') === -1 &&                    // first access page
                    !self.responseURL.indexOf('/rest/analytics/1.0/publish/bulk')               // edit issue
                )
            ) {
                return;
            }

            debug('backlog page');

            getIssuesFromBoard()
                .then(response => {
                    if (response && response.hasOwnProperty('issues')) {
                        const issues = response.issues;

                        debug('XMLHttpRequest has issues');
                        debug(issues);

                        for (const issue of issues) {
                            try {
                                createElementStatusAfterVisibleOnScreen(issue);
                            } catch (error) {
                                console.log(error.message);
                            }
                        }
                    }
                })
                .catch(error => console.error(error));

        });
        send.apply(this, arguments);
    };
})(XMLHttpRequest);
