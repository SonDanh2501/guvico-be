import { Controller, Get, StreamableFile, Res, Header, Param } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express';

@Controller('file')
export class FileController {
    @Get('download/:idDateLog')
    getFile(
        @Res({ passthrough: true }) res: Response,
        @Param('idDateLog') idDateLog: string,
        ): StreamableFile 
    {
      const file = createReadStream(join(process.cwd(), `log/${idDateLog}/error.log`));
      console.log(file, 'file')
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${idDateLog}error.log"`,
      });
      return new StreamableFile(file);
    }
  
    // Or even:
    @Get('test1')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="package.json"')
    getStaticFile(): StreamableFile {
      const file = createReadStream(join(process.cwd(), 'package.json'));
      return new StreamableFile(file);
    }  
}
