import { useState } from "react";
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Modal, Image, PermissionsAndroid, Platform } from "react-native";
import { RNCamera } from 'react-native-camera'
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ImagePicker from 'react-native-image-picker'

export default function App() {
  const [type, setType] = useState(RNCamera.Constants.Type.back)
  const [open, setOpen] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)

  // Capturar imagem
  async function takePicture(camera) {
    const options = { quality: 0.5, base64: true }
    const data = await camera.takePictureAsync(options)

    setCapturedPhoto(data.uri)
    setOpen(true)
    console.log('foto tirada: ' + data.uri)

    // Salva foto
    savePicture(data.uri)
  }

  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission)
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission)
    return status === 'granted'
  }

  async function savePicture(data) {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return
    }

    CameraRoll.save(data, 'photo').then((res) => {
      console.log('Salvo com sucesso: ' + res)
    })
      .catch((err) => {
        console.log('Erro ao salvar: ' + err)
      })

  }

  // Muda a camera frontal e a de tras
  function toggleCam() {
    setType(type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back)
  }

  function openAlbum() {
    const options = {
      title: 'Selecione uma foto',
      chooseFromLibraryButtonTitle: 'Buscar foto do album',
      noData: true,
      mediaType: 'photo'
    }

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Image picker cancelado')
      } else if (response.error) {
        console.log('Image picker error')
      } else {
        setCapturedPhoto(response.uri)
        setOpen(true)
      }
    })
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <RNCamera
        style={styles.preview}
        type={type}
        flashMode={RNCamera.Constants.FlashMode.auto}
        androidCameraPermissionOptions={{
          title: 'Permissao para usar a camera',
          message: 'Nós precisamos usar a sua camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancelar'
        }}
      >
        {({ camera, status, recordAndroidPermissionStatus }) => {
          if (status !== 'READY') return <View />

          return (
            <View
              style={{ marginBottom: 35, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                onPress={() => takePicture(camera)}
                style={styles.capture}
              >
                <Text>Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openAlbum}
                style={styles.capture}
              >
                <Text>Album</Text>
              </TouchableOpacity>
            </View>
          )
        }}
      </RNCamera>

      <View style={styles.camPosition}>
        <TouchableOpacity onPress={toggleCam}>
          <Text>Trocar</Text>
        </TouchableOpacity>
      </View>

      {
        capturedPhoto &&

        <Modal animationType="slide" transparent={false} visible={open}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20 }}>
            <TouchableOpacity onPress={() => setOpen(false)}
              style={{ margin: 10 }}
            >
              <Text style={{ fontSize: 24 }}>fechar</Text>
            </TouchableOpacity>

            <Image
              redizeMode='container'
              style={{ width: 350, height: 450, borderRadius: 15 }}
              source={{ uri: capturedPhoto }}
            />
          </View>
        </Modal>
      }

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
    borderRadius: 50 / 2
  },
  camPosition: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 10,
    height: 40,
    position: 'absolute',
    right: 25,
    top: 60
  }
})