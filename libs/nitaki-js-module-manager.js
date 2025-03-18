class ModuleManager {
    constructor(containerId, settingsContainerId) {
        this.container = document.getElementById(containerId);
        this.settingsContainer = document.getElementById(settingsContainerId);
    }

    addModule(name, hasSettings, ...settings) {
        const moduleDiv = this.createModuleDiv(name, hasSettings);
        this.container.appendChild(moduleDiv);

        if (hasSettings) {
            const draggableDiv = this.createSettingsDiv(name, settings);
            this.settingsContainer.appendChild(draggableDiv);
        }
    }

    createModuleDiv(name, hasSettings) {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'module';
        const moduleInput = document.createElement('input');
        moduleInput.setAttribute('aria-label', name.toLowerCase());
        moduleInput.type = 'checkbox';
        moduleInput.id = this.generateId(name, 'module');
        moduleInput.style.marginRight = '0.2rem';
        moduleInput.value = 'true';
        const moduleLabel = document.createTextNode(' ' + name);
        moduleDiv.appendChild(moduleInput);
        moduleDiv.appendChild(moduleLabel);

        moduleInput.onchange = () => {
            if (hasSettings) {
                const draggableDiv = document.getElementById(this.generateId(name, 'draggable'));
                draggableDiv.style.display = moduleInput.checked ? '' : 'none';
            }
        };
    
        return moduleDiv;
    }

    createSettingsDiv(name, settings) {
        const draggableDiv = document.createElement('div');
        draggableDiv.id = this.generateId(name, 'draggable');
        draggableDiv.className = 'draggable';

        draggableDiv.style.position = 'absolute';
        draggableDiv.style.top = '10px';
        draggableDiv.style.left = '10px';
        draggableDiv.style.width = '300px';
        draggableDiv.style.display = 'none'; // Hide by default

        const settingsDiv = document.createElement('div');
        const header = this.createDraggableHeader(name, settingsDiv);

        draggableDiv.appendChild(header);
        draggableDiv.appendChild(settingsDiv);

        settings.forEach(setting => {
            const label = document.createElement('label');
            label.innerText = setting.name;
            const input = document.createElement('input');
            input.type = setting.type;
            input.id = this.generateId(name, 'settings', setting.name);
            input.className = 'settings_input';

            if (setting.type === 'number' || setting.type === 'range') {
                input.value = setting.value;
                input.step = setting.step;
                input.min = setting.min;
                input.max = setting.max;
            } else if (setting.type === 'checkbox') {
                input.checked = setting.value;
            } else if (setting.type === 'color' || setting.type === 'text') {
                input.value = setting.value;
            }

            label.appendChild(input);
            settingsDiv.appendChild(label);
        });

        this.makeDraggable(header);

        const moduleInput = document.getElementById(this.generateId(name, 'module'));
        draggableDiv.onclick = function () {
            draggableDiv.style.display = moduleInput.checked ? '' : 'none';
        };

        return draggableDiv;
    }

    getModuleSetting(name, settingName) {
        const settingsPrefix = this.generateId(name, 'settings');
        const input = document.getElementById(settingsPrefix + '_' + settingName.toLowerCase().replace(/\s+/g, '_'));
        return input.type === 'checkbox' ? input.checked : input.value;
    }

    isModuleEnabled(name) {
        const moduleInput = document.getElementById(this.generateId(name, 'module'));
        return moduleInput.checked;
    }

    reverseGenerateId(id) {
        return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    createDraggableHeader(name, settingDiv) {
        const header = document.createElement('div');
        header.style.cursor = 'move';
        header.className = 'draggable-header';
        const toggleButton = document.createElement('button');
        const moduleName = document.createTextNode(' ' + name);
        toggleButton.innerText = 'Hide/Show';
        toggleButton.className = 'toggle-button';
        header.appendChild(moduleName);
        header.appendChild(toggleButton);

        toggleButton.onclick = () => {
            settingDiv.style.display = settingDiv.style.display === 'none' ? '' : 'none';
        };

        return header;
    }

    generateId(name, prefix, suffix = '') {
        return prefix + '_' + name.toLowerCase().replace(/\s+/g, '_') + (suffix ? '_' + suffix.toLowerCase().replace(/\s+/g, '_') : '');
    }

    makeDraggable(element) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;
    
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
    
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.parentElement.style.top = (element.parentElement.offsetTop - pos2) + "px";
            element.parentElement.style.left = (element.parentElement.offsetLeft - pos1) + "px";
        }
    
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

const moduleManager = new ModuleManager('effect-list', 'effect-settings-container');

document.addEventListener('dragstart', function (event) {
    if (event.target.className === 'draggable') {
        const dragGhost = document.createElement('div');
        dragGhost.style.display = 'none';
        event.target.appendChild(dragGhost);
        event.dataTransfer.setDragImage(dragGhost, 0, 0);
        event.dataTransfer.setData('text/plain', event.target.id);
    }
});

document.addEventListener('dragover', function (event) {
    if (event.target.className === 'draggable') {
        event.preventDefault();
    }
});

document.addEventListener('drop', function (event) {
    if (event.target.className === 'draggable') {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(id);
        event.target.parentNode.insertBefore(draggableElement, event.target.nextSibling);
    }
});

console.log("Nitaki's Module Manager loaded successfully!");