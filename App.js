import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (waitingForOperand) return;
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const performCalculation = (a, b, op) => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (isNaN(x) || isNaN(y)) return b;
    let result = 0;
    switch (op) {
      case '+':
        result = x + y;
        break;
      case '−':
        result = x - y;
        break;
      case '×':
        result = x * y;
        break;
      case '÷':
        if (y === 0) return 'Error';
        result = x / y;
        break;
      default:
        return y;
    }
    // Handle floating point precision
    const rounded = Math.round(result * 1000000000) / 1000000000;
    return String(rounded);
  };

  const handleOperator = (nextOperator) => {
    const inputValue = display;

    if (previousValue !== null && operator && !waitingForOperand) {
      const result = performCalculation(previousValue, inputValue, operator);
      setDisplay(result);
      setPreviousValue(result);
    } else {
      setPreviousValue(inputValue);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    if (operator && previousValue !== null) {
      const result = performCalculation(previousValue, display, operator);
      setDisplay(result);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const toggleSign = () => {
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const formatDisplay = (val) => {
    if (val === 'Error') return 'Error';
    if (val.includes('.') && val.length > 12) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        return num.toPrecision(10).replace(/\.?0+$/, '');
      }
    }
    return val;
  };

  const renderButton = (label, onPress, style, textStyle) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.title}>Calculator</Text>
      </View>
      <View style={styles.displayContainer}>
        <Text
          style={styles.displayText}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatDisplay(display)}
        </Text>
        {operator && (
          <Text style={styles.operatorIndicator}>{operator}</Text>
        )}
      </View>
      <View style={styles.buttonGrid}>
        <View style={styles.row}>
          {renderButton('AC', clearAll, styles.fnButton, styles.fnButtonText)}
          {renderButton('⌫', backspace, styles.fnButton, styles.fnButtonText)}
          {renderButton('±', toggleSign, styles.fnButton, styles.fnButtonText)}
          {renderButton('÷', () => handleOperator('÷'), styles.opButton, styles.opButtonText)}
        </View>
        <View style={styles.row}>
          {renderButton('7', () => inputDigit(7))}
          {renderButton('8', () => inputDigit(8))}
          {renderButton('9', () => inputDigit(9))}
          {renderButton('×', () => handleOperator('×'), styles.opButton, styles.opButtonText)}
        </View>
        <View style={styles.row}>
          {renderButton('4', () => inputDigit(4))}
          {renderButton('5', () => inputDigit(5))}
          {renderButton('6', () => inputDigit(6))}
          {renderButton('−', () => handleOperator('−'), styles.opButton, styles.opButtonText)}
        </View>
        <View style={styles.row}>
          {renderButton('1', () => inputDigit(1))}
          {renderButton('2', () => inputDigit(2))}
          {renderButton('3', () => inputDigit(3))}
          {renderButton('+', () => handleOperator('+'), styles.opButton, styles.opButtonText)}
        </View>
        <View style={styles.row}>
          {renderButton('0', () => inputDigit(0), styles.zeroButton)}
          {renderButton('.', inputDot)}
          {renderButton('=', handleEquals, styles.eqButton, styles.eqButtonText)}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  title: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  operatorIndicator: {
    color: '#ff9500',
    fontSize: 24,
    fontWeight: '300',
    marginTop: 4,
  },
  displayText: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: '300',
    textAlign: 'right',
  },
  buttonGrid: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#333333',
    marginHorizontal: 4,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '400',
  },
  zeroButton: {
    flex: 2,
    alignItems: 'flex-start',
    paddingLeft: 30,
  },
  fnButton: {
    backgroundColor: '#a5a5a5',
  },
  fnButtonText: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  opButton: {
    backgroundColor: '#ff9500',
  },
  opButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  eqButton: {
    backgroundColor: '#ffffff',
  },
  eqButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
});