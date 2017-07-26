	_uacct = "UA-2223138-1";
	urchinTracker();
function onLoad() {
    var version = getSilverlightVersion();
    if (version) { __utmSetVar(version); }
}
function getSilverlightVersion() {

    var version = 'No Silverlight';

    var container = null;

    try {

        var control = null;

        if (window.ActiveXObject) {

            control = new ActiveXObject('AgControl.AgControl');

        }

        else {

            if (navigator.plugins['Silverlight Plug-In']) {

                container = document.createElement('div');

                document.body.appendChild(container);

                container.innerHTML= '<embed type="application/x-silverlight" src="data:," />';

                control = container.childNodes[0];

            }

        }

        if (control) {

            if (control.isVersionSupported('5.0')) { version = 'Silverlight/5.0'; }

            else if (control.isVersionSupported('4.0')) { version = 'Silverlight/4.0'; }

            else if (control.isVersionSupported('3.0')) { version = 'Silverlight/3.0'; }

            else if (control.isVersionSupported('2.0')) { version = 'Silverlight/2.0'; }
            else if (control.isVersionSupported('1.0')) { version = 'Silverlight/1.0'; }
        }
    }
    catch (e) { }
    if (container) {
        document.body.removeChild(container);
    }
    return version;
}
onLoad();