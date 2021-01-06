/**
 * Small utility to handle dragging
 * 
 * not related with WebGl
 * 
 */

export class Dragger {
    constructor(element, callbacks) {
        this.element = element;
        this.callbacks = callbacks;

        element.addEventListener("mousedown", e => this.handleMouseDown(e))
        element.addEventListener("mousemove", e => this.handleMouseMove(e))
        element.addEventListener("mouseup", e => this.handleMouseUp(e))
        element.addEventListener("mouseout", e => this.handleMouseOut(e))

    }

    _updateFrom(e) {
        this.dragState.deltaLast = [e.clientX - this.dragState.last[0], e.clientY - this.dragState.last[1]];
       
        this.dragState.last = [e.clientX, e.clientY];
        this.dragState.deltaStart = [e.clientX - this.dragState.start[0], e.clientY - this.dragState.start[1]];

    }


    handleMouseDown(e) {
        //CCconsole.log("mousedown", e)
        this.dragState = {
            start: [e.clientX, e.clientY],
            last: [e.clientX, e.clientY],
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            moved:false
        };
        this.callbacks.started?.(this.dragState)
    }

    handleMouseUp(e) {
        //CCconsole.log("mouseup", e)
        if (this.dragState && !this.dragState.moved) {
            this.callbacks.click?.(e)
            this.dragState = null
        } else {
            this.handleMouseUpOrOut(e);
        }
    }
    handleMouseUpOrOut(e) {
        //CCconsole.log("mouseuporout", e)
        if (this.dragState) {
            this._updateFrom(e)
            this.callbacks.done?.(this.dragState)
            this.dragState = null
        }
    }

    handleMouseOut(e) {
        //CCconsole.log("mouseout", e)
        this.handleMouseUp(e);
    }

    handleMouseMove(e) {
      //  //CCconsole.log("mousemove")
        if (this.dragState) {
            this.dragState.moved=true
            this._updateFrom(e)
            this.callbacks.moved?.(this.dragState)
        }
    }
}