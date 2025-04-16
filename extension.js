// Simple Toogle Button Extension

const TOGGLE_SCRIPT_PATH='.local/share/gnome-shell/extensions/scaletoggle@t-vk.github.com/scaletoggle.py' // relative to home

import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const TOGGLE_ON_ICON = 'computer-symbolic';
const TOGGLE_OFF_ICON = 'video-display-symbolic';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init () {
        super._init(0.0, 'Scale Toggle Button');
    
        this._icon = new St.Icon({
            icon_name: 'video-display-symbolic',
            style_class: 'system-status-icon',
        });

        this.add_child(this._icon);

        this.connect('event', this._onClicked.bind(this));
    }
    _onClicked(actor, event) {
        if ((event.type() !== Clutter.EventType.TOUCH_BEGIN && event.type() !== Clutter.EventType.BUTTON_PRESS)) {
            // Some other non-clicky event happened; bail
            return Clutter.EVENT_PROPAGATE;
        }
    
        // Hopefully, I can figure out how to do this with imports.gi.Gio.DBus/DBusProxy in the future or even better without dbus entirely.
        let proc = Gio.Subprocess.new(['python3', TOGGLE_SCRIPT_PATH], Gio.SubprocessFlags.NONE);
        proc.wait_check_async(null, (proc, result) => {
            try {
                if (proc.wait_check_finish(result)) {
                    log(`Successfully ran ${TOGGLE_SCRIPT_PATH}`);
                } else {
                    log(`Failed running ${TOGGLE_SCRIPT_PATH}`);
                }
            } catch (e) {
                logError(e);
            }
        });

        if (this._icon.icon_name === TOGGLE_ON_ICON) {
            this._icon.icon_name = TOGGLE_OFF_ICON;
            log('Toggle has been turned off!');
        } else {
            this._icon.icon_name = TOGGLE_ON_ICON;
            log('Toggle has been turned on!');
        }
        
        return Clutter.EVENT_PROPAGATE;
    }
});

export default class ScaleToggleExtension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();
        
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}