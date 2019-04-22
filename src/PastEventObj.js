

class PastEventObj {

    constructor(title, date, numAttend, numFresh, numSoph, numJun, numSen){
        this.title = title;
        this.date = date;
        this.numAttend = numAttend;
        this.numFresh = numFresh;
        this.numSoph = numSoph;
        this.numJun = numJun;
        this.numSen = numSen;
    }

    getTitle(){
        return this.title;
    }

    getDate(){
        return this.date;
    }

    getAttend(){
        return this.numAttend;
    }

    getFresh(){
        return this.numFresh;
    }

    getSoph(){
        return this.numSoph;
    }

    getJun(){
        return this.numJun;
    }

    getSen(){
        return this.numSen;
    }

}

export default PastEventObj;