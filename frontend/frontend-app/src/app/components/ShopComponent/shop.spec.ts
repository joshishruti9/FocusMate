import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ShopComponent } from './shop.component';
import { ShopService } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;

  beforeEach(async () => {
    const fakeUserService = { getUserByEmail: (email: string) => of({ userEmail: 'test@example.com', rewardPoints: 150 }) };
    const userSubject = new (class { public value: any; private _subs: any[] = []; constructor(val: any) { this.value = val; } subscribe(cb: any){ cb(this.value); this._subs.push(cb); return { unsubscribe: () => {} }}; next(v: any){ this.value = v; this._subs.forEach((cb:any)=>cb(v)); } })( { userEmail: 'test@example.com' } );
    const fakeAuthService = { getUser: () => ({ userEmail: 'test@example.com' }), currentUser$: userSubject as any };
    const fakeShopService = { getItems: () => of([{ _id: '1', name: 'Dog with Hat', price: 100, imageUrl: 'http://example.com/dog.png' }]) };
    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: UserService, useValue: fakeUserService }
        , { provide: ShopService, useValue: fakeShopService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and show reward points for logged in user', () => {
    expect(component.rewardPoints).toBe(150);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h5')?.textContent).toContain('Reward points: 150');
  });

  it('should enable purchase button when rewardPoints > item.price', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.hasAttribute('disabled')).toBeFalsy();
  });

  it('should disable purchase button when rewardPoints <= item.price', () => {
    // set rewardPoints equal to price
    component.rewardPoints = 100;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.hasAttribute('disabled')).toBeTruthy();
  });
});
