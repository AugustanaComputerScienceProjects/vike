

class PastEventObj {

    constructor(title, date, numAttend, stuList){
        this.title = title;
        this.date = date;
        this.numAttend = numAttend;
        this.stuList = stuList;
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

    getStuList(){
        return this.stuList;
    }

}

export default PastEventObj;