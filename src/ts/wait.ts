async function wait(ms: number, message?: string): Promise<void> {
    console.log('waiting: ', message)
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export default wait;