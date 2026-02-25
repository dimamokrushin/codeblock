let variables = {
    a: 0,
    b: 0,
    c: 0
};

function updateVariablesDisplay() {
    let text = '{ ';
    for (let name in variables) {
        text += name + ': ' + variables[name] + ', ';
    }
    text = text.slice(0, -2) + ' }';
    document.getElementById('variables-display').innerText = text;
}

function updateSelect() {
    let select = document.getElementById('var-select');
    select.innerHTML = '';
    
    for (let name in variables) {
        let option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
}

function declareVariables() {
    let inputText = document.getElementById('var-names').value;
    let names = inputText.split(',').map(name => name.trim());
    let newCount = 0;
    
    for (let i = 0; i < names.length; i++) {
        let name = names[i];
        if (name !== '') {
            variables[name] = 0;
            newCount++;
        }
    }
    
    updateSelect();
    updateIfSelect();
    updateVariablesDisplay();
    
    if (newCount > 0) {
        alert('Добавлено переменных: ' + newCount);
    } else {
        alert('Нет имён для объявления');
    }
}

function assignVariable() {
    let varName = document.getElementById('var-select').value;
    let expression = document.getElementById('var-value').value;
    
    try {
        let value = evaluateExpression(expression);
        
        if (isNaN(value)) {
            alert('Ошибка: выражение "' + expression + '" не вычисляется');
            return;
        }
        
        let oldValue = variables[varName];
        
        variables[varName] = value;
        alert(varName + ' = ' + expression + ' = ' + value + ' (было ' + oldValue + ')');
        updateVariablesDisplay();
    }
    catch (error) {
        alert('Ошибка в выражении: ' + expression);
    }
}

function resetAll() {
    variables = {
        a: 0,
        b: 0,
        c: 0
    };
    updateSelect();
    updateVariablesDisplay();
    alert('Всё сброшено к начальным значениям');
}

function evaluateExpression(expr) {
    expr = expr.replace(/\s/g, '');
    
    if (!isNaN(expr)) {
        return Number(expr);
    }
    
    if (variables.hasOwnProperty(expr)) {
        return variables[expr];
    }
    
    while (expr.includes('(')) {
        expr = expr.replace(/\(([^()]+)\)/g, (match, inner) => {
            return mathOperation(inner);
        });
    }
    
    return mathOperation(expr);
}

function mathOperation(expr) {
    while (expr.includes('//')) {
        expr = expr.replace(/(\d+\.?\d*|[a-z]+)\s*\/\/\s*(\d+\.?\d*|[a-z]+)/, (match, left, right) => {
            let leftVal = isNaN(left) ? variables[left] : Number(left);
            let rightVal = isNaN(right) ? variables[right] : Number(right);
            return Math.floor(leftVal / rightVal);
        });
    }
    
    while (expr.includes('*') || expr.includes('/') || expr.includes('%')) {
        expr = expr.replace(/(\d+\.?\d*|[a-z]+)\s*([*/%])\s*(\d+\.?\d*|[a-z]+)/, (match, left, op, right) => {
            let leftVal = isNaN(left) ? variables[left] : Number(left);
            let rightVal = isNaN(right) ? variables[right] : Number(right);
            
            if (op === '*') return leftVal * rightVal;
            if (op === '/') return leftVal / rightVal;
            if (op === '%') return leftVal % rightVal;
        });
    }
    
    while (expr.includes('+') || expr.includes('-')) {
        expr = expr.replace(/(\d+\.?\d*|[a-z]+)\s*([+\-])\s*(\d+\.?\d*|[a-z]+)/, (match, left, op, right) => {
            let leftVal = isNaN(left) ? variables[left] : Number(left);
            let rightVal = isNaN(right) ? variables[right] : Number(right);
            
            if (op === '+') return leftVal + rightVal;
            if (op === '-') return leftVal - rightVal;
        });
    }

    return Number(expr);
}

function updateIfSelect() {
    let select = document.getElementById('if-left-var');
    select.innerHTML = '';
    
    for (let name in variables) {
        let option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
}

function executeIf() {
    let leftVar = document.getElementById('if-left-var').value;
    let leftVal = variables[leftVar];
    
    let operator = document.getElementById('if-operator').value;
    
    let rightExpr = document.getElementById('if-right-value').value;
    let rightVal;
    
    if (variables.hasOwnProperty(rightExpr)) {
        rightVal = variables[rightExpr];
    } else {
        rightVal = evaluateExpression(rightExpr);
    }
    
    let conditionResult = false;
    let conditionText = leftVar + ' ' + operator + ' ' + rightExpr;
    
    switch(operator) {
        case '>':
            conditionResult = leftVal > rightVal;
            break;
        case '<':
            conditionResult = leftVal < rightVal;
            break;
        case '==':
            conditionResult = leftVal == rightVal;
            break;
        case '!=':
            conditionResult = leftVal != rightVal;
            break;
        case '>=':
            conditionResult = leftVal >= rightVal;
            break;
        case '<=':
            conditionResult = leftVal <= rightVal;
            break;
    }
    
    let resultDiv = document.getElementById('if-result');
    
    if (conditionResult) {
        resultDiv.className = 'if-result true';
        resultDiv.innerHTML = ' Условие верно: ' + conditionText + ' (' + leftVal + ' ' + operator + ' ' + rightVal + ')';
        
        let commands = document.getElementById('if-commands').value;
        
        if (commands.trim() !== '') {
            executeIfCommands(commands);
        }
    } else {
        resultDiv.className = 'if-result false';
        resultDiv.innerHTML = ' Условие не верно: ' + conditionText + ' (' + leftVal + ' ' + operator + ' ' + rightVal + ')';
    }
}

function executeIfCommands(commandsText) {
    let lines = commandsText.split('\n');
    let executedCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        if (line === '') continue;
        
        if (line.includes('=')) {
            let parts = line.split('=');
            let varName = parts[0].trim();
            let expr = parts[1].trim();
            
            if (variables.hasOwnProperty(varName)) {
                try {
                    let value = evaluateExpression(expr);
                    if (!isNaN(value)) {
                        variables[varName] = value;
                        executedCount++;
                    }
                } catch (e) {
                    console.log('Ошибка в команде:', line);
                }
            }
        }
    }
    
    updateVariablesDisplay();
    updateSelect();
    updateIfSelect();
    
    if (executedCount > 0) {
        alert('Выполнено команд в блоке IF: ' + executedCount);
    }
}

updateSelect();
updateVariablesDisplay();