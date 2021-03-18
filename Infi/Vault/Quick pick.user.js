// ==UserScript==
// @name         Vault Favorites
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Shows customized list of your favorite tasks
// @author       You
// @match        https://vault.infi.nl/uren/invoer.php*
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    let listPanel = createAndAddContainer();
    let favoriteItems = loadFavorites();

    rebuildList();
    createNewFavoriteButton();

    function createNewFavoriteButton() {
        let buttonContainer = document.querySelector(".form-actions");
        let addButton = document.createElement("button");
        addButton.value = "Toevoegen aan favorieten";
        addButton.className = "btn";
        addButton.innerText = "+ Favoriet";
        addButton.addEventListener("click", (e) => {
            e.preventDefault();
            let project = getSelectedProjectId();
            let task = getSelectedTaskId();
            let comment = getComment();

            addFavorite(project, task, comment);
        });
        buttonContainer.appendChild(addButton);
    }

    function getSelectedProjectId() {
        let projectName = document.querySelector(".project-typeahead").value;

        for(let task of document.querySelectorAll("#project_id option")) {
            if(task.innerText == projectName) {
                return {id: parseInt(task.value), name: task.innerText};
            }
        }

        return null;
    }

    function getSelectedTaskId() {
        let taskName = document.querySelector("#selectator_taak_id .selectator_chosen_item_title").innerText;

        for(let task of document.querySelectorAll("#taak_id option")) {
            if(task.innerText == taskName) {
                return {id: parseInt(task.value), name: task.innerText};
            }
        }

        return null;
    }

    function getComment() {
        let selectedItem = document.querySelector("#opmerking");
        return selectedItem?.value;
    }

    function addFavorite(project, task, comment) {
        if(!favoriteItems[project.name]) {
            favoriteItems[project.name] = [];
        }
        let tasks = favoriteItems[project.name];
        let name = comment.length > 0 ? comment : task.name;

        tasks.push({title: name, comment: comment, projectId: project.id, taskId: task.id});

        favoritesChanged();
    }

    function removeFavorite(projectKey, task) {
        let items = favoriteItems[projectKey];
        let index = items.indexOf(task);

        items.splice(index, 1);
        if(items.length > 0) {
            favoriteItems[projectKey] = items;
        } else {
            delete favoriteItems[projectKey];
        }

        favoritesChanged();
    }

    function editFavorite(item){
        let newName = window.prompt(`What is the new name for: '${item.title}'`, item.title);

        if(newName) {
            item.title = newName;
            favoritesChanged();
        }
    }

    function favoritesChanged() {
        sortItems();
        saveFavorites();
        rebuildList();
    }

    function sortItems() {
        for(let key in favoriteItems) {
            favoriteItems[key].sort((i1, i2) => {
                if (i1.title < i2.title) {
                    return -1;
                }
                if (i1.title > i2.title) {
                    return 1;
                }

                return 0;
            });
        }
    }

    function loadFavorites() {
        let stringValue = GM_getValue("favorites");

        if(stringValue) {
            return JSON.parse(stringValue);
        } else {
            return {
                Infi: [
                    {title: "Teammeeting", comment: "Teammeeting", projectId: 22, taskId: 8402},
                    {title: "Persoonlijke ontwikkeling", comment: "", projectId: 22, taskId: 7965},
                ],
            };
        }
    }

    function saveFavorites() {
        let stringValue = JSON.stringify(favoriteItems);
        GM_setValue("favorites", stringValue);
    }

    function createAndAddContainer() {
        const after = document.querySelector(".weekly-facturabiliteit + ul");
        const parent = after.parentElement;

        let container = document.createElement("div");
        parent.insertBefore(container, after);

        return container;
    }

    function rebuildList() {
        listPanel.innerHTML = "";

        let header = document.createElement("div");
        header.innerText = "Favorieten";
        header.className = "facturabiliteit-header";
        listPanel.appendChild(header);

        for(let key in favoriteItems) {
            let groupContainer = document.createElement("div");
            groupContainer.style.marginBottom = "1rem";
            let header = document.createElement("div");
            header.innerText = key;
            groupContainer.appendChild(header);

            for(let item of favoriteItems[key]) {
                const panel = document.createElement("div");

                const link = createLinkButton(item.title, () => selectProjectPost(item.projectId, item.taskId, item.comment, "", item.wbsoProjectId));
                panel.appendChild(link);

                const removeLink = createLinkButton("✖", () => removeFavorite(key, item));
                removeLink.innerHTML = '<i class="icon-trash"></i>';
                removeLink.style.float = "right";
                removeLink.title = "Remove";
                panel.appendChild(removeLink);

                const editLink = createLinkButton("🖉", () => editFavorite(item));
                editLink.innerHTML = '<i class="icon-edit"></i>';
                editLink.style.float = "right";
                editLink.style.marginTop = "1px";
                editLink.style.marginRight = ".5em";
                editLink.title = "Rename";
                panel.appendChild(editLink);

                groupContainer.appendChild(panel);
            }

            listPanel.appendChild(groupContainer);
        }

        listPanel.appendChild(document.createElement("hr"));
    }

    function createLinkButton(text, callback) {
        const link = document.createElement("a");
        link.href = "#";
        link.innerText = text;
        link.addEventListener("click", (e) => {
            e.preventDefault();
            callback();
        });

        return link;
    }
})();