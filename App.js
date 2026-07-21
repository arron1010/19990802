import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForNewValue) {
      setDisplay(String(digit));
      setWaitingForNewValue(false);
    } else {
      if (display === '0') {
        setDisplay(String(digit));
      } else {
        setDisplay(display + String(digit));
      }
    }
  };

  const inputDot = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const toggleSign = () => {
    if (display === '0') return;
    if (display.startsWith('-')) {
      setDisplay(display.substring(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const inputPercent = () => {
    const value = parseFloat(display);
    if (isNaN(value)) return;
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operator);
      const rounded = roundResult(result);
      setDisplay(String(rounded));
      setPreviousValue(rounded);
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      default: return b;
    }
  };

  const roundResult = (num) => {
    if (isNaN(num) || !isFinite(num)) return 'Error';
    return Math.round(num * 1000000) / 1000000;
  };

  const equals = () => {
    if (operator === null || previousValue === null) return;
    const inputValue = parseFloat(display);
    const result = calculate(previousValue, inputValue, operator);
    const rounded = roundResult(result);
    setDisplay(String(rounded));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const formatDisplay = (text) => {
    if (text === 'Error') return text;
    if (text.length > 12) {
      const num = parseFloat(text);
      if (!isNaN(num)) {
        return num.toExponential(6);
      }
    }
    return text;
  };

  const Btn = ({ label, onPress, style, textStyle }) => (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.btnText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {formatDisplay(display)}
        </Text>
      </View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          <Btn label="AC" onPress={clearAll} style={styles.fnBtn} textStyle={styles.fnText} />
          <Btn label="+/-" onPress={toggleSign} style={styles.fnBtn} textStyle={styles.fnText} />
          <Btn label="%" onPress={inputPercent} style={styles.fnBtn} textStyle={styles.fnText} />
          <Btn label="÷" onPress={() => performOperation('÷')} style={styles.opBtn} textStyle={styles.opText} />
        </View>

        <View style={styles.row}>
          <Btn label="7" onPress={() => inputDigit(7)} style={styles.numBtn} />
          <Btn label="8" onPress={() => inputDigit(8)} style={styles.numBtn} />
          <Btn label="9" onPress={() => inputDigit(9)} style={styles.numBtn} />
          <Btn label="×" onPress={() => performOperation('×')} style={styles.opBtn} textStyle={styles.opText} />
        </View>

        <View style={styles.row}>
          <Btn label="4" onPress={() => inputDigit(4)} style={styles.numBtn} />
          <Btn label="5" onPress={() => inputDigit(5)} style={styles.numBtn} />
          <Btn label="6" onPress={() => inputDigit(6)} style={styles.numBtn} />
          <Btn label="-" onPress={() => performOperation('-')} style={styles.opBtn} textStyle={styles.opText} />
        </View>

        <View style={styles.row}>
          <Btn label="1" onPress={() => inputDigit(1)} style={styles.numBtn} />
          <Btn label="2" onPress={() => inputDigit(2)} style={styles.numBtn} />
          <Btn label="3" onPress={() => inputDigit(3)} style={styles.numBtn} />
          <Btn label="+" onPress={() => performOperation('+')} style={styles.opBtn} textStyle={styles.opText} />
        </View>

        <View style={styles.row}>
          <Btn label="0" onPress={() => inputDigit(0)} style={[styles.numBtn, styles.zeroBtn]} />
          <Btn label="." onPress={inputDot} style={styles.numBtn} />
          <Btn label="=" onPress={equals} style={styles.opBtn} textStyle={styles.opText} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
  },
  displayContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 120,
  },
  displayText: {
    color: '#ffffff',
    fontSize: 80,
    fontWeight: '300',
    textAlign: 'right',
  },
  keypad: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    height: 80,
    marginHorizontal: 4,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '400',
  },
  numBtn: {
    backgroundColor: '#333333',
  },
  fnBtn: {
    backgroundColor: '#a5a5a5',
  },
  fnText: {
    color: '#000000',
  },
  opBtn: {
    backgroundColor: '#ff9500',
  },
  opText: {
    color: '#ffffff',
    fontSize: 36,
  },
  zeroBtn: {
    flex: 2.08,
    alignItems: 'flex-start',
    paddingLeft: 32,
  },
});