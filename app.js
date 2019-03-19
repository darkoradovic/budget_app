 var config = {
    apiKey: "AIzaSyASfCNKjWqKP6yPYfmqzqDrvOx3QoyZvaA",
    authDomain: "budget-app-8.firebaseapp.com",
    databaseURL: "https://budget-app-8.firebaseio.com",
    projectId: "budget-app-8",
    storageBucket: "budget-app-8.appspot.com",
    messagingSenderId: "282540764006"
};
firebase.initializeApp(config);

var dataRef = firebase.database().ref(); 

//BUDGET CONTROLLER
var budgetController = (() => {

    var Exprense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Exprense.prototype.calcPercentages = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Exprense.prototype.getPercentages = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = (type) => {
        var sum = 0;
        data.allItems[type].forEach((cur) => {
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,

    };

    return {
        addItem: (type, des, val) => {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            if (type == 'exp') {
                newItem = new Exprense(ID, des, val);
            } else if (type = 'inc') {
                newItem = new Income(ID, des, val)
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: () => {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: () => {
            data.allItems.exp.forEach((cur) => {
                cur.calcPercentages(data.totals.inc);
            });
        },

        getPercentages: () => {
            var allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },


         sendData: () => {
            var newdataRef = dataRef.push();
            newdataRef.set({
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            });
        }, 

        testing: () => {
            console.log(data);
        }
    }

})();

formatNumber = (num, type) => {
    var numSplit, num, int, dec; 

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if(int.length > 3){
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
}

//UI CONTROLLER
var UIController = (() => {

    var DOMstrings = {
        inputType: '.add__type',
        inputDes: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        descriptionLabel: '.item__description',
        container: '.container',
        expensesPerc: '.item__percentage',
        date: '.budget__title--month'
    }

    nodeListForEach = (list, callback) => {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDes).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addLIstItem: function (obj, type) {
            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="far fa-times-circle"></i></button> </div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDes + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach((current, index, array) => {
                current.value = '';

            });
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: (percentages) => {

            var fields = document.querySelectorAll(DOMstrings.expensesPerc);

            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });
        },

        displayDate: () => {
            var year, months, now, month;

            now = new Date();
            year = now.getFullYear();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            document.querySelector(DOMstrings.date).textContent = months[month] + ' ' + year;
        },

        changeType: () => {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ','+
                DOMstrings.inputDes + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, (cur) => {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();



//GLOBAL APP CONTROLLER
var contoller = ((budgetCtr, UICtr) => {

    var setupEventListeners = () => {
        var DOM = UICtr.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    
        document.querySelector(DOM.inputType).addEventListener('change', UICtr.changeType);
    };

    var updateBudget = () => {
        budgetCtr.calculateBudget();

        var budget = budgetCtr.getBudget();
        //console.log(budget);
        UICtr.displayBudget(budget);

    };

    var updatePercentages = () => {
        budgetCtr.calculatePercentages();

        var percentages = budgetCtr.getPercentages();
        console.log(percentages);

        UICtr.displayPercentages(percentages);
    };

    var ctrlAddItem = () => {
        var input, newItem;

        input = UICtr.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtr.addItem(input.type, input.description, input.value);

            UICtr.addLIstItem(newItem, input.type);

            UICtr.clearFields();

            updateBudget();

            updatePercentages();

            budgetCtr.sendData();

        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtr.deleteItem(type, ID);

            UICtr.deleteListItem(itemID);

            updateBudget();

            updatePercentages();
        }
    };

    return {
        init: () => {

            var dataRecRef = firebase.database().ref();

            dataRecRef.on('value', (data) => {
                //console.log(data.val())
                var num = data.val();
                var keys = Object.keys(num);
                console.log(keys);
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    var budget = num[k].budget;
                    var totalInc = num[k].totalInc;
                    var totalExp = num[k].totalExp;
                    var percentage = num[k].percentage;
                    console.log(budget, totalExp, totalInc, percentage);

                    var type;
                    budget > 0 ? type = 'inc' : type = 'exp';

                    document.querySelector('.budget__value').textContent = formatNumber(budget, type);
                    document.querySelector('.budget__income--value').textContent = formatNumber(totalInc, 'inc');
                    document.querySelector('.budget__expenses--value').textContent = formatNumber(totalExp, 'exp');
                    document.querySelector('.budget__expenses--percentage').textContent = percentage + '%';
                    
                }
            });

            console.log('Application runing...');
            UICtr.displayDate()
            UICtr.displayBudget({

                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListeners();

        }
    }

})(budgetController, UIController);

contoller.init();