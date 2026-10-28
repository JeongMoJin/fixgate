const Handlebars = require("handlebars");

class Member {
  constructor(first, last) {
    this.first = first;
    this.last = last;
  }
  get fullName() {
    return `${this.last}${this.first}`;
  }
}

const template = Handlebars.compile("{{fullName}}님, 주문 {{count}}건이 도착했습니다");

function greeting(first, last, count) {
  const member = new Member(first, last);
  member.count = count;
  return template(member);
}

module.exports = { greeting };
