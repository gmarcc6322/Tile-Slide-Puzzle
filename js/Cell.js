class Cell {
    constructor(props, container, rows, cols) {
        this.props = props;
        this.rows = rows;
        this.cols = cols;
        this.createElement(container, cols);
        this.render();
    }
    changeProps(newProps) {
        this.props = {
            ...this.props,
            ...newProps,
        };
        this.render();
    }
    clickHandler(event) {
        if (this.props.canMove) {
            this.props.onMove(this);
        }
    }
    createElement(container, cols) {
        let containerWidth = container.offsetWidth;
        let containerHeight = container.offsetHeight;
        let cellWidth = (((containerWidth - cols) / cols - 4) / containerWidth) * 100;
        let cellHeight = (((containerHeight - this.rows) / this.rows - 4) / containerHeight) * 100;

        this.element = createElement(
            "div",
            {
                className: "cell",
            },
            this.props.number
        );
        this.element.addEventListener("click", this.clickHandler.bind(this));

        this.element.style.width = `${cellWidth}%`;
        this.element.style.height = `${cellHeight}%`;
        this.element.style.fontSize = `${cellHeight * 5}%`;
    }
    render() {
        if (this.props.canMove) {
            this.element.classList.add("cell--can-move");
        } else {
            this.element.classList.remove("cell--can-move");
        }
        if (this.props.position) {
        this.element.style.left = this.props.position.cell * (100 / this.cols) + "%";
        this.element.style.top = this.props.position.row * (100 / this.rows) + "%";
        }
    }
}
