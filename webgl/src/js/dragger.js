// small utility to handle dragging

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
        console.log("mousedown", e)
        this.dragState = {
            start: [e.clientX, e.clientY],
            last: [e.clientX, e.clientY],
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey
        };
        this.callbacks.started?.(this.dragState)
    }

    handleMouseUp(e) {
        console.log("mouseup", e)
        if (this.dragState) {
            this._updateFrom(e)
            this.callbacks.done?.(this.dragState)
            this.dragState = null
        }
    }

    handleMouseOut(e) {
        console.log("mouseout", e)
        this.handleMouseUp(e);
    }

    handleMouseMove(e) {
        console.log("mousemove")
        if (this.dragState) {
            this._updateFrom(e)
            this.callbacks.moved?.(this.dragState)
        }
    }
}