//this object contains the necessary information for the past event to display/know about
class PastEventObj {
  constructor(id, title, date, numAttend, stuList) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.numAttend = numAttend;
    this.stuList = stuList;
  }

  getTitle() {
    return this.title;
  }

  getDate() {
    return this.date;
  }

  getAttend() {
    return this.numAttend;
  }

  getStuList() {
    return this.stuList;
  }
}

export default PastEventObj;
