import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { BarCodeScanner } from 'expo-barcode-scanner';
// import Pepito from './lib/iota/pepito';
class App extends Component {

  render() {
    return (
      <Home navigation={{ navigate: this.props.navigation.navigate }} />
    );
  }
}
//
class Home extends Component {
  state = {
    hasCameraPermission: null,
    scanned1: false,
    scanned2: false,
    addr: "",
    bottles: {},
    stage: 0,
    done: false,
    amount: 100,
  };

  async componentDidMount() {
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  };

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned1: true, addr: data, stage: this.state.stage + 1 });
  };

  handleBottleScanned = ({ type, data }) => {
    this.setState({ scanned2: true, bottles: { ...this.state.bottles, [data]: { uid: data, amount: (this.state.bottles[data]) ? this.state.bottles[data].amount + 1 : 1 } }, stage: this.state.stage + 1 });
  };

  componentDidUpdate() {
    console.log("state: ", this.state);
  }

  pay(addr, amount) {
    this.setState({ done: true, stage: -1 }, () => {
      fetch('http://10.0.1.9:3000/pay', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addr, amount }) // body data type must match "Content-Type" header
      }).then(res => res.json()).then(resJson => console.log(res)).catch(err => console.error(err));
    })
  }
  render() {
    const { hasCameraPermission, scanned1, scanned2, stage, done } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    if (stage === 0) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
          <Text>Please Scan your Crypto Address</Text>
          <BarCodeScanner
            onBarCodeScanned={scanned1 ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </View>)
    }

    if (stage === 1) {
      return (<View>
        <Text> {`Your Address is ${this.state.addr}, is that corrent?`}</Text>
        <Button title='Yes, continue to scan bottles' onPress={() => this.setState({ stage: this.state.stage + 1 })}></Button>
        <Button title='No, Go back, I want to re-scan' onPress={() => this.setState({ stage: this.state.stage - 1, scanned1: false })}></Button>
      </View>)
    }

    if (stage === 2) {
      return (<View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <Text>Please Scan your Crypto Address</Text>
        <BarCodeScanner
          onBarCodeScanned={scanned2 ? undefined : this.handleBottleScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>)
    }
    if (stage === 3) {
      return (<View>
        <Text> Thank you!, Would you like to scan another bottle?</Text>
        <Button title='Yes' onPress={() => this.setState({ stage: this.state.stage - 1, scanned2: false })}></Button>
        <Button title='No, no I am done' onPress={() => this.pay(this.state.addr, 120)}></Button>
      </View>)
    }
    if (done === true && stage === -1) {
      const bottlesNum = Object.values(this.state.bottles).reduce((accu, item) => accu + item.amount, 0);
      return (<View>
        <Text> {`Thank you! you got 0.0002 ETH for ${bottlesNum} recycled`}</Text>
      </View>)
    }
  }
}

const AppNavigator = createStackNavigator({
  Home: {
    screen: Home,
    params: {
      title: `Bottle scanner, press next to start`,
      nextScreen: 'BarcodeScanner'
    }
  }
});

export default createAppContainer(AppNavigator);

const styles = StyleSheet.create({
});
