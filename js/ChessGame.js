(function () {
    var toAsc = (val) => val.charCodeAt(),
        toStr = (val) => val + "",
        toChr = (val) => String.fromCharCode(val),
        toNum = (val) => val * 1,
        maxVal = (val1, val2) => val1 > val2 ? val1 : val2,
        minVal = (val1, val2) => val1 < val2 ? val1 : val2,
        isExist = (obj, val) => (obj instanceof String ? obj.search(val) : obj.indexOf(val)) > -1,
        getColName = (crd) => crd[0],
        getRowName = (crd) => crd.substr(1, 2),
        createDiv = () => document.createElement("div"),
        Chessboard = class {
            constructor(width, height, container) {
                this.chesses = {};
                this.view = createDiv();
                this.width = width;
                this.height = height;
                this.view.style.width = width * 60 + "px";
                this.view.style.height = height * 60 + "px";
                this.view.className = "ChessGame-brd";
                for (var row = 0; row < height; row++) {
                    var boardRow = createDiv();
                    boardRow.className = "ChessGame-row";
                    for (var col = 0; col < width; col++) {
                        var boardCol = createDiv(),
                            chess = createDiv(),
                            crd = toChr(col + 65) + (row + 1);
                        boardCol.className = "ChessGame-col";
                        chess.className = "ChessGame-chs";
                        chess.id = crd;
                        this.chesses[crd] = new Chess(crd, this, chess);
                        boardCol.appendChild(chess);
                        boardRow.appendChild(boardCol);
                    }
                    this.view.appendChild(boardRow);
                }
                container.appendChild(this.view);
            }
            getChessByCrd(crd) { return this.chesses[crd]; }
            getChessesByCrd(crd) {
                var chesses = [];
                crd = crd.replace(/ /g, "");
                if (isExist(crd, ",")) {
                    crd = crd.split(",");
                    for (var s = 0; s < crd.length; s++)
                        chesses = chesses.concat(this.getChessesByCrd(crd[s]));
                    return chesses;
                }
                if (isExist(crd, ":")) {
                    var val = crd.split(":"),
                        minColName, maxColName,
                        minRowName, maxRowName;
                    for (var s = 0; s < 2; s++) {
                        var colName, rowName;
                        if (val[s].length < 2) {
                            if (isNaN(val[s])) colName = val[s];
                            else rowName = val[s];
                        } else {
                            if (isNaN(val[s])) {
                                colName = getColName(val[s]);
                                rowName = getRowName(val[s]);
                            } else rowName = val[s];
                        }
                        if (!maxColName) {
                            maxColName = colName;
                            minColName = colName;
                        } else if (colName) {
                            var colName1 = maxColName,
                                colName2 = colName;
                            maxColName = maxVal(colName1, colName2);
                            minColName = minVal(colName1, colName2);
                        }
                        if (!maxRowName) {
                            maxRowName = rowName;
                            minRowName = rowName;
                        } else if (rowName) {
                            var rowName1 = maxRowName,
                                rowName2 = rowName;
                            maxRowName = maxVal(rowName1, rowName2);
                            minRowName = minVal(rowName1, rowName2);
                        }
                    }
                    for (var col = toAsc(minColName); col < toAsc(maxColName) + 1; col++)
                        for (var row = minRowName; row < toNum(maxRowName) + 1; row++)
                            chesses.push(this.chesses[toChr(col) + row]);
                    return chesses;
                }
                if (crd.length == 1 && isNaN(crd))
                    return this.getChessesByCrd(crd + "1:" + this.height);
                else if (!isNaN(crd))
                    return this.getChessesByCrd("A:" + toChr(this.height + 64) + crd);
                return [this.chesses[crd]];
            }
            clean() {
                for (var s in this.chesses) {
                    var chess = this.chesses[s];
                    chess.title = chess.crd;
                    chess.color = "";
                    chess.background = "";
                    chess.opacity = "";
                    chess.symbol = "";
                }
            }
        },
        Chess = class {
            constructor(crd, chessboard, view) {
                this.crd = crd;
                this.chessboard = chessboard;
                this._ = {
                    setSpec: null, setProc: null,
                    title: crd, symbol: "",
                    color: "", background: "",
                    opacity: "",
                };
                this.view = view;
                this.view.title = crd;
                this.view.addEventListener("click", function () {
                    if (!this._.setSpec || this._.setSpec.bind(this)(this.crd))
                        if (this._.setProc) this._.setProc.bind(this)(this.crd);
                }.bind(this));
            }
            get title() { return this._.title; }
            get color() { return this._.color; }
            get opacity() { return this._.opacity; }
            get symbol() { return this._.symbol; }
            get background() { return this._.background; }
            get setSpec() { return this._.setSpec; }
            get setProc() { return this._.setProc; }
            set title(val) { return this.view.title = val, this._.title = val; }
            set color(val) { return this.view.style.color = val, this._.color = val; }
            set opacity(val) { return this.view.style.opacity = val, this._.color = val; }
            set symbol(val) { return this.view.innerHTML = val, this._.symbol = val; }
            set background(val) { return this.view.style.background = val, this._.background = val; }
            set setSpec(val) { return this._.setSpec = val; }
            set setProc(val) { return this._.setProc = val; }
            getRelCrdByCrd(crd) {
                var chessColName = toAsc(getColName(this.crd)), crdColName = toAsc(getColName(crd)), colChange = chessColName - crdColName,
                    chessRowName = toNum(getRowName(this.crd)), crdRowName = toNum(getRowName(crd)), rowChange = chessRowName - crdRowName;
                return (Math.sign(rowChange) > 0 ? (rowChange + "F") : Math.sign(rowChange) < 0 ? (Math.abs(rowChange) + "B") : "") +
                    (Math.sign(colChange) > 0 ? (colChange + "L") : Math.sign(colChange) < 0 ? (Math.abs(colChange) + "R") : "");
            }
            getRelCrdsByCrds() {
                var crds = arguments, relCrds = [];
                if (crds[0] instanceof Array) crds = crds[0];
                for (var s = 0; s < crds.length; s++)
                    relCrds.push(this.getRelCrdByCrd(crds[s]));
                return relCrds;
            }
            getRelCrdByChess(chess) { return this.getRelCrdByCrd(chess.crd); }
            getRelCrdsByChesses() {
                var chesses = arguments, relCrds = [];
                if (chesses[0] instanceof Array) chesses = chesses[0];
                for (var s = 0; s < chesses.length; s++)
                    relCrds.push(this.getRelCrdByCrd(chesses[s].crd));
                return relCrds;
            }
            getChessByRelCrd(relCrd) { return this.chessboard.chesses[this.getCrdByRelCrd(relCrd)]; }
            getChessesByRelCrd(relCrd) {
                var crds = this.getCrdsByRelCrd(relCrd), chesses = [];
                for (var s = 0; s < crds.length; s++)
                    chesses.push(this.chessboard.chesses[crds[s]]);
                return chesses;
            }
            getCrdByRelCrd(relCrd) {
                var colName = getColName(this.crd), colChange = 0,
                    rowName = getRowName(this.crd), rowChange = 0,
                    val = relCrd.replace(/F|B|R|L/g, "");
                if (!isNaN(val) && val != "") {
                    var repeatRelCrd = relCrd.replace(val, "");
                    relCrd = "";
                    for (var i = 0; i < val; i++) relCrd += repeatRelCrd;
                    return this.getCrdByRelCrd(relCrd);
                }
                for (var s = 0; s < relCrd.length; s++)
                    rowChange += relCrd[s] == "F" ? -1 : relCrd[s] == "B" ? 1 : 0,
                        colChange += relCrd[s] == "R" ? 1 : relCrd[s] == "L" ? -1 : 0;
                return toChr(toAsc(colName) + colChange) + (toNum(rowName) + rowChange);
            }
            getCrdsByRelCrd(relCrd) {
                var crds = [];
                relCrd = relCrd.replace(/ /g, "");
                if (isExist(relCrd, ",")) {
                    relCrd = relCrd.split(",");
                    for (var s = 0; s < relCrd.length; s++)
                        crds = crds.concat(this.getCrdsByRelCrd(relCrd[s]));
                    return crds;
                }
                var val = relCrd.replace(/F|B|R|L|E|X|O|I|H/g, "");
                if (!isNaN(val) && val != "") {
                    var val = toNum(val),
                        repeatRelCrd = relCrd.replace(val, "");
                    relCrd = "";
                    for (var i = 0; i < val; i++)
                        relCrd += repeatRelCrd;
                    return this.getCrdsByRelCrd(relCrd);
                }
                if (isExist(relCrd, "E"))
                    return this.getCrdsByRelCrd(relCrd.replace(/E/g, "I") + "," + relCrd.replace(/E/g, "H"));
                if (isExist(relCrd, "X"))
                    return this.getCrdsByRelCrd(relCrd.replace(/X/g, "IH"));
                if (isExist(relCrd, "O"))
                    return this.getCrdsByRelCrd(relCrd.replace(/O/g, "E") + "," + relCrd.replace(/O/g, "X"));
                if (isExist(relCrd, "I")) {
                    var dir = "FB";
                    for (var s = 0; s < 2; s++)
                        crds = crds.concat(this.getCrdsByRelCrd(relCrd.replace(/I/g, dir[s])));
                    return crds;
                }
                if (isExist(relCrd, "H")) {
                    var dir = "RL";
                    for (var s = 0; s < 2; s++)
                        crds = crds.concat(this.getCrdsByRelCrd(relCrd.replace(/H/g, dir[s])));
                    return crds;
                }
                return [this.getCrdByRelCrd(relCrd)];
            }
        }
    window.Chessboard = Chessboard;
    window.Chess = Chess;
})();