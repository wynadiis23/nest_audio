import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginTokenDto {
  @ApiProperty({
    example:
      'ya29.a0AfB_byA3WO7MPXdU3Twsy-XNqNY8837vqLmYFNmqxflsnwxgHwmerSVCVQ0qrfFOkfwvUNQZQev5aR4QJ4JTmUQZrLNdZJTzJE0Dx4lVhOvolbaE1XSDYytaCEbOcfyTMxCEQSPLcc9GeLNW7ASTZYUnpiHPymEWdgaCgYKAesSARASFQHGX2MirAfhU_1h0waV9lCuou26-w0169',
  })
  token: string;
}
