export default class Spi { 
  write(buffer: Buffer, callback?: (error: any, data: any) => void) {
    console.log(`SpiMock.write: Buffer(${buffer.toString('hex')}`);
  }
}